import { AuthenticatedRequest } from "@/middlewares";
import { hotelsService } from "@/services/hotels-service";
import {Response} from "express";
import httpStatus from "http-status";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;
    try{
        const result = await hotelsService.getHotels(userId);
        res.send(result).status(200);

    }catch (e){
        if(e.name === "PAYMENT_REQUIRED"){
            return res.status(httpStatus.PAYMENT_REQUIRED).send({});   
          }
          return res.status(httpStatus.NOT_FOUND).send({});
        }
            
          
          
}

export async function getHotelByid(req: AuthenticatedRequest, res: Response) {
    const {hotelId} = req.params;
    const {userId} = req;
    try{
        const result = await hotelsService.getHotelByid(parseInt(hotelId), userId);
        
        res.status(httpStatus.OK).send(result);
    } catch(e){
        if(e.name === "PAYMENT_REQUIRED"){
            return res.status(httpStatus.PAYMENT_REQUIRED).send({});   
          }
          return res.status(httpStatus.NOT_FOUND).send({});
        
    }
       
    
}