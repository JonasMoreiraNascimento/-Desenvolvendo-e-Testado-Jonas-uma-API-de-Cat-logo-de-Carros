import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const app = express();
const port = 3000; 

app.use(express.json());

const carSchema = z.object({
    name: z.string().min(1).max(255),
    description: z.string().max(255).optional(),
    brand: z.string().min(1).max(255),
    year: z.number().int().min(1900).max(9999),
    km: z.number().int().min(0),
});

app.post('/cars', async (req: Request, res: Response) => {
    try {
        const { name, description, brand, year, km } = carSchema.parse(req.body);

        const car = await prisma.car.create({
            data: {
                name,
                description,
                brand,
                year,
                km,
            },
        });

        res.status(201).json(car);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: 'Corpo da requisição inválido.' });
        } else {
            console.error('Erro ao inserir o carro:', error);
            res.status(500).json({ error: 'Erro interno do servidor.' });
        }
    }
});

app.get('/cars', async (req: Request, res: Response) => {
    try {
        const cars = await prisma.car.findMany();
        res.json(cars);
    } catch (error) {
        console.error('Erro ao buscar os carros:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

app.get('/cars/:carId', async (req: Request, res: Response) => {
    const { carId } = req.params;
    try {
        const car = await prisma.car.findUnique({
            where: { id: carId },
        });
        if (!car) {
            res.status(404).json({ message: 'Carro não encontrado.' });
        } else {
            res.json(car);
        }
    } catch (error) {
        console.error('Erro ao buscar o carro:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

app.patch('/cars/:carId', async (req: Request, res: Response) => {
    const { carId } = req.params;
    try {
        const { name, description, brand, year, km } = carSchema.partial().parse(req.body);

        const updatedCar = await prisma.car.update({
            where: { id: carId },
            data: {
                name,
                description,
                brand,
                year,
                km,
            },
        });

        res.json(updatedCar);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: 'Corpo da requisição inválido.' });
        } else if (error.code === 'P2025') {
            res.status(404).json({ message: 'Carro não encontrado.' });
        } else {
            console.error('Erro ao atualizar o carro:', error);
            res.status(500).json({ error: 'Erro interno do servidor.' });
        }
    }
});

app.delete('/cars/:carId', async (req: Request, res: Response) => {
    const { carId } = req.params;
    try {
        await prisma.car.delete({
            where: { id: carId },
        });
        res.sendStatus(204);
    } catch (error) {
        if (error.code === 'P2025') {
            res.status(404).json({ message: 'Carro não encontrado.' });
        } else {
            console.error('Erro ao excluir o carro:', error);
            res.status(500).json({ error: 'Erro interno do servidor.' });
        }
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});