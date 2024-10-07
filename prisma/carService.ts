import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createCar(brand: string, model: string, year: number, price: number) {
    return await prisma.car.create({
        data: {
            brand,
            model,
            year,
            price,
        },
    });
}