import { prisma } from "@/config";

async function getHotels() {
    return prisma.hotel.findMany()
}

async function getHotelByid(hotelId: number) {
    return prisma.hotel.findFirst({
        where:{
            id: hotelId
        },
        include: {
            Rooms: true
        }
    });
}

async function findEnrollmentById(userId:number) {
    const result = await prisma.enrollment.findUnique({
        where: {
            userId
        }
    });
    return result;
}

async function findTicketById(enrollmentId: number){
    const result = await prisma.ticket.findFirst({
        where: {
            enrollmentId
        }
    });
    return result;
}

async function findTicketTypeById(id: number) {
    const result = await prisma.ticketType.findFirst({
        where:{id}
    });
    return result;
}

export const hotelRepository = {
    getHotels,
    getHotelByid,
    findEnrollmentById,
    findTicketById,
    findTicketTypeById
    
}