import { notFoundError } from "@/errors";
import enrollmentRepository from "@/repositories/enrollment-repository";
import { hotelRepository } from "@/repositories/hotels-respository";
import enrollmentsService from "../enrollments-service";

async function getHotels(userId: number) {
    const enrollment = await hotelRepository.findEnrollmentById(userId);
    if(!enrollment) throw notFoundError();
        
    const ticket = await hotelRepository.findTicketById(enrollment.id);
    if(!ticket) throw notFoundError();

    if(ticket.status !== "PAID") throw {name: "PAYMENT_REQUIRED"};

    const ticketType = await hotelRepository.findTicketTypeById(ticket.ticketTypeId);
    if(ticketType.isRemote === true || ticketType.includesHotel === false) throw {name: "PAYMENT_REQUIRED"};
      
    const result =await hotelRepository.getHotels();
    if (!result || result.length === 0) {
        throw notFoundError();
      }
        
    return result;
}

async function getHotelByid(hotelId: number, userId: number) {

    const enrollment = await hotelRepository.findEnrollmentById(userId);
    if(!enrollment) throw notFoundError();
        
    const ticket = await hotelRepository.findTicketById(enrollment.id);
    if(!ticket) throw notFoundError();

    if(ticket.status !== "PAID") throw {name: "PAYMENT_REQUIRED"};

    const ticketType = await hotelRepository.findTicketTypeById(ticket.ticketTypeId);
    if(ticketType.isRemote === true || ticketType.includesHotel === false) throw {name: "PAYMENT_REQUIRED"};

    const result = await hotelRepository.getHotelByid(hotelId);
    if (!result) {
        throw notFoundError();
      }

    return result;
}

export const hotelsService = {
    getHotelByid,
    getHotels
}