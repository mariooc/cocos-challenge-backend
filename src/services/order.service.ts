import { FIAT_TICKER, FIAT_UNIT } from '@/constants/orders.constant';
import { dataSource } from '@/entities/dataSource';
import { Instrument } from '@/entities/instrument.entity';
import { MarketData } from '@/entities/marketData.entity';
import { Order } from '@/entities/order.entity';
import { User } from '@/entities/user.entity';
import { UserSummary } from '@/entities/userSummary.entity';
import { BusinessError } from '@/errors';

import {
  CreateOrderInput,
  InvestmentType,
  OrderSide,
  OrderStatus,
  OrderType,
} from '@/types/order.types';
import { logger } from '@/utils/logger.utils';

const validationsOnCreateOrder = async (input: CreateOrderInput) => {
  const { userId, ticker, side } = input;

  const user = await User.getUser(userId);
  if (!user) {
    logger.error(`User ${userId} not found`);
    throw new BusinessError(`User ${userId} not found`);
  }

  const getLatestByTicker = await MarketData.getLatestByTicker(ticker);
  if (!getLatestByTicker) {
    logger.error(`MarketData not found for instrument ${ticker}`);
    throw new BusinessError(`MarketData not found for instrument ${ticker}`);
  }

  if (side === OrderSide.SELL) {
    const getInstrumentByTicker = await UserSummary.getInstrumentByTicker(
      userId,
      ticker
    );
    if (!getInstrumentByTicker) {
      logger.error(`UserSummary not found for instrument ${ticker}`);
      throw new BusinessError(`UserSummary not found for instrument ${ticker}`);
    }
  }

  return true;
};

const validationsOnFunds = ({
  userARS,
  position,
  input,
  marketData,
}: {
  userARS: number;
  position: UserSummary | null;
  marketData: MarketData;
  input: CreateOrderInput;
}) => {
  let error: string | null = null;
  let totalPrice = 0;
  let size = 0;

  const { close: currentPrice } = marketData;
  const { ticker } = input;

  if (input.investmentType === InvestmentType.SHARES) {
    totalPrice = currentPrice * input.investmentAmount;
    size = input.investmentAmount;
  } else {
    totalPrice = input.investmentAmount;
    size = input.investmentAmount / currentPrice;
  }

  if (input.side === OrderSide.BUY) {
    if (userARS < totalPrice) {
      const message = `Insuficiente ARS para comprar ${totalPrice}, ARS: ${userARS}`;
      logger.error(message);
      error = message;
    }

    if (!Number.isInteger(size)) {
      logger.error(`La cantidad de acciones no es un numero entero ${size}`);
      error = `La cantidad de acciones no es un numero entero ${size}`;
    }
  }

  if (input.side === OrderSide.SELL) {
    if (!position) {
      const message = `User not has position for instrument ${ticker}`;
      logger.error(message);
      throw new BusinessError(message);
    }

    if (size > position.totalSize) {
      const message = `${input.ticker} cantidad insuficiente para vender (${size}) > : position:(${position.totalSize})`;
      logger.error(message);
      error = message;
    }

    if (!Number.isInteger(size)) {
      const message = `${input.ticker} cantidad no es un numero entero (${size})`;
      logger.error(message);
      error = message;
    }
  }

  return {
    error,
    data: {
      price: currentPrice,
      size,
      totalPrice,
    },
  };
};

const buildOrder = ({
  user,
  instrument,
  size,
  price,
  type,
  side,
  status,
}: {
  user: User;
  instrument: Instrument;
  size: number;
  price: number;
  type: OrderType;
  side: OrderSide;
  status: OrderStatus;
}) => {
  const order = new Order();
  order.user = user;
  order.instrument = instrument;
  order.size = size;
  order.price = price;
  order.type = type;
  order.side = side;
  order.status = status;
  order.datetime = new Date();

  return order;
};

export const createOrder = async (input: CreateOrderInput) => {
  await validationsOnCreateOrder(input);

  return await dataSource.manager.transaction(
    async (transactionalEntityManager) => {
      const { userId, ticker, type, side } = input;
      logger.info(`Creating order for user ${userId} on instrument ${ticker}`);

      let [instrument, fiat, marketData, position, userARS, user] =
        await Promise.all([
          Instrument.getByTicker(ticker),
          Instrument.getByTicker(FIAT_TICKER),
          MarketData.getLatestByTicker(ticker),
          UserSummary.getInstrumentByTicker(userId, ticker),
          UserSummary.getARS(userId),
          User.getUser(userId),
        ]);

      // TODO: CHECK NOT-NULL ASSERTION
      instrument = instrument!;
      marketData = marketData!;
      user = user!;
      fiat = fiat!;

      const errorFunds = validationsOnFunds({
        userARS,
        position,
        marketData,
        input,
      });

      const { price, size, totalPrice } = errorFunds.data;
      logger.info(`Price: ${price}, Size: ${size}, TotalPrice: ${totalPrice}`);
      logger.info(`UserARS: ${userARS}, Position: ${position?.totalSize}`);

      if (errorFunds.error) {
        logger.error(errorFunds.error);
        const order = buildOrder({
          user,
          instrument,
          size,
          price,
          type,
          side,
          status: OrderStatus.REJECTED,
        });
        const saveOrder = await transactionalEntityManager.save(order);
        return saveOrder;
      }

      const status =
        type === OrderType.MARKET ? OrderStatus.FILLED : OrderStatus.NEW;

      const order = buildOrder({
        user,
        instrument,
        size,
        price,
        type,
        side,
        status,
      });

      const saveOrder = await transactionalEntityManager.save(order);

      if (type === OrderType.MARKET) {
        const cashOrder = buildOrder({
          user,
          instrument: fiat,
          size: totalPrice,
          price: FIAT_UNIT,
          type,
          side: side === OrderSide.BUY ? OrderSide.CASH_OUT : OrderSide.CASH_IN,
          status,
        });
        await transactionalEntityManager.save(cashOrder);
      }

      return saveOrder;
    }
  );
};
