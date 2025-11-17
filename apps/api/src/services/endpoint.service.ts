import { prisma } from "../utils/prisma";

export class EndpointService {
  async getAll() {
    return prisma.endpoint.findMany();
  }

  async create(data: any) {
    return prisma.endpoint.create({ data });
  }
}
