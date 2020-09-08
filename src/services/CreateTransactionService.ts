import { getCustomRepository, getRepository } from 'typeorm';
// import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface RequestDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: RequestDTO): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);
    const existCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    if (type === 'outcome') {
      const { total } = await transactionRepository.getBalance();
      if (total < value) {
        throw new AppError('You have no balance', 400);
      }
    }

    let categoryTransaction;
    if (!existCategory) {
      categoryTransaction = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(categoryTransaction);
    } else {
      categoryTransaction = existCategory;
    }

    const transaction = transactionRepository.create({
      title,
      type,
      value,
      category_id: categoryTransaction.id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
