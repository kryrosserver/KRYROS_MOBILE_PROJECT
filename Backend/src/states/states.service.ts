import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStateDto } from './dto/create-state.dto';
import { UpdateStateDto } from './dto/update-state.dto';

@Injectable()
export class StatesService {
  constructor(private prisma: PrismaService) {}

  async create(createStateDto: CreateStateDto) {
    return this.prisma.state.create({
      data: createStateDto,
    });
  }

  async findAll(countryId?: string) {
    return this.prisma.state.findMany({
      where: countryId ? { countryId } : {},
      include: {
        _count: {
          select: { cities: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.state.findUnique({
      where: { id },
      include: {
        country: true,
        cities: true,
      },
    });
  }

  async update(id: string, updateStateDto: UpdateStateDto) {
    return this.prisma.state.update({
      where: { id },
      data: updateStateDto,
    });
  }

  async remove(id: string) {
    return this.prisma.state.delete({
      where: { id },
    });
  }
}
