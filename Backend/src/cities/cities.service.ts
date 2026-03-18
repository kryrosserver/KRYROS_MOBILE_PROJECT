import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';

@Injectable()
export class CitiesService {
  constructor(private prisma: PrismaService) {}

  async create(createCityDto: CreateCityDto) {
    return this.prisma.city.create({
      data: createCityDto,
    });
  }

  async findAll(stateId?: string) {
    return this.prisma.city.findMany({
      where: stateId ? { stateId } : {},
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.city.findUnique({
      where: { id },
      include: {
        state: {
          include: { country: true },
        },
      },
    });
  }

  async update(id: string, updateCityDto: UpdateCityDto) {
    return this.prisma.city.update({
      where: { id },
      data: updateCityDto,
    });
  }

  async remove(id: string) {
    return this.prisma.city.delete({
      where: { id },
    });
  }
}
