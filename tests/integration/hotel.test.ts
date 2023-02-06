import supertest from "supertest";
import app, { init } from "@/app";
import { cleanDb } from "../helpers";
import { prisma } from "@/config";
import dayjs from "dayjs";

beforeAll(async () => {
    await init();
    await cleanDb();
  });
  
  const api = supertest(app);


  describe("GET /hotels", () => {
  
    beforeAll(async() => {
      await prisma.event.create({
        data:{
          title:"evento 1",
          backgroundImageUrl: "https://kleeventos.com.br/wp-content/uploads/2019/11/AdobeStock_100250075-1030x687.jpeg",
          logoImageUrl: "https://passevip.com.br/wp-content/uploads/2018/04/2018-04-23-como-aumentar-o-alcance-e-atrair-publico-para-seu-evento.jpg",
          startsAt:dayjs().subtract(1, "day").toDate(),
          endsAt: dayjs().add(5, "days").toDate()
      }
      })
      await prisma.room.deleteMany({});
      await prisma.hotel.deleteMany({});
  
  
      await prisma.hotel.createMany({
        data:[
          {
            "name": "hotel 1",
            "image": "https://media-cdn.tripadvisor.com/media/photo-s/25/04/93/1e/blossom-hotel-houston.jpg",
          },
          {
            "name": "hotel 2",
            "image": "https://static.pmweb.com.br/QWGkhUt5ZvcZPtidVOM7Flu9h1g=/https://letsimage.s3.sa-east-1.amazonaws.com/editor/atlantica/pt/nossos-hoteis/1628195088415-banner-mobile-red.jpg",
          }
        ]
      });
  
    });
  
    it('should respond with status 401 when does not has Authorization', async () => {
      const result = await api.get("/hotels")
      expect(result.status).toBe(401)
  });
  
  it('should respond with status 401 when does not has token', async () => {
    const result = await api.get("/hotels").set({Authorization: "Bearer 00000000000000"})
    expect(result.status).toBe(401)
  });
  let userId: number;
  let token: string;
 
    
  it('should respond with status 404 when user does not has enrollment', async () => {
    const signup = await api.post("/users").send({email: "test@test.com", password: "123456"})
    expect(signup.status).toBe(201)
  
    const signin = await api.post("/auth/sign-in").send({email: "test@test.com", password: "123456"})
    expect(signin.status).toBe(200)
  
    token = signin.body.token;
    userId = signin.body.user.id;
  
    const result = await api.get("/hotels").set({ Authorization: `Bearer ${token}` })
    expect(result.status).toBe(404)
  });
  
  let enrollmentId: number;
  
  it('should respond with status 404 when user does not has ticket', async () => {
    const enrollment = await prisma.enrollment.create({
      data:{
        name: "test",
        cpf: "00000000000",
        birthday: "2000-01-01T00:00:00.000Z",
        phone:"00000000000",
        userId
      }
    })
  
    enrollmentId = enrollment.id
  
    const result = await api.get("/hotels").set({ Authorization: `Bearer ${token}`})
    expect(result.status).toBe(404)
    
  });
  
  it('should respond with status 402 when the ticket was not paid', async () => {
    const ticketType = await prisma.ticketType.create({
      data:{
        name: "test",
        price: 200,
        isRemote: true,
        includesHotel:false
      }
    })
  
    await prisma.ticket.create({
      data:{
        ticketTypeId: ticketType.id,
        enrollmentId,
        status: "RESERVED"
      }
    })
  
    const result = await api.get("/hotels").set({ Authorization: `Bearer ${token}`})
    expect(result.status).toBe(402)
    
  });
  
  it('should respond with status 402 when the ticket type is remote', async () => {
    await prisma.ticket.deleteMany()
    await prisma.ticketType.deleteMany()
  
    const ticketType = await prisma.ticketType.create({
      data:{
        name: "test",
        price: 200,
        isRemote:true,
        includesHotel: false
      }
    })
  
    await prisma.ticket.create({
      data:{
        ticketTypeId: ticketType.id,
        enrollmentId,
        status: "PAID"
      }
    })
  
    const result = await api.get("/hotels").set({ Authorization: `Bearer ${token}`})
    expect(result.status).toBe(402)
    
  });
  
  it('should respond with status 402 when the ticket type does not include hotel', async () => {
    await prisma.ticket.deleteMany()
    await prisma.ticketType.deleteMany()
  
    const ticketType = await prisma.ticketType.create({
      data:{
        name: "test",
        price: 200,
        isRemote: false,
        includesHotel:false
      }
    })
  
    await prisma.ticket.create({
      data:{
        ticketTypeId: ticketType.id,
        enrollmentId,
        status: "PAID"
      }
    })
  
    const result = await api.get("/hotels").set({ Authorization: `Bearer ${token}`})
    expect(result.status).toBe(402)
    
  });
  
  it('should respond with status 200 when all is ok', async () => {
    await prisma.ticket.deleteMany()
    await prisma.ticketType.deleteMany()
  
    const ticketType = await prisma.ticketType.create({
      data:{
        name: "test",
        price: 200,
        isRemote: false,
        includesHotel:true
      }
    })
  
    await prisma.ticket.create({
      data:{
        ticketTypeId: ticketType.id,
        enrollmentId,
        status: "PAID"
      }
    })
  
    const result = await api.get("/hotels").set({ Authorization: `Bearer ${token}`})
    expect(result.status).toBe(200)
    expect(result.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          image: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        })
      ])
    )
    
  });
  
  it('should respond with status 404 when does not has hotels', async () => {
    await prisma.room.deleteMany()
    await prisma.hotel.deleteMany()
  
  
    const result = await api.get("/hotels").set({ Authorization: `Bearer ${token}`})
    expect(result.status).toBe(404)
  
  });
  
  })
  
  
  describe("GET /hotels/:hotelId", () => {
  
    beforeAll(async() => {
      await cleanDb();
      await prisma.event.create({
        data:{
            title:"evento 1",
            backgroundImageUrl: "https://kleeventos.com.br/wp-content/uploads/2019/11/AdobeStock_100250075-1030x687.jpeg",
            logoImageUrl: "https://passevip.com.br/wp-content/uploads/2018/04/2018-04-23-como-aumentar-o-alcance-e-atrair-publico-para-seu-evento.jpg",
            startsAt:dayjs().subtract(1, "day").toDate(),
            endsAt: dayjs().add(5, "days").toDate()
      }
      })
      await prisma.room.deleteMany({})
      await prisma.hotel.deleteMany({})
  
  
      await prisma.hotel.createMany({
        data:[
            {
                "name": "hotel 1",
                "image": "https://media-cdn.tripadvisor.com/media/photo-s/25/04/93/1e/blossom-hotel-houston.jpg",
              },
              {
                "name": "hotel 2",
                "image": "https://static.pmweb.com.br/QWGkhUt5ZvcZPtidVOM7Flu9h1g=/https://letsimage.s3.sa-east-1.amazonaws.com/editor/atlantica/pt/nossos-hoteis/1628195088415-banner-mobile-red.jpg",
              }
        ]
      })
  
       const hotels = await prisma.hotel.findMany()
  
        await prisma.room.createMany({
          data:[
            {
              name: "room1",
              capacity: 4,
              hotelId: hotels[0].id,
            },
            {
              name: "room2",
              capacity: 3,
              hotelId: hotels[0].id,
            },
            {
              name: "room1",
              capacity: 2,
              hotelId: hotels[1].id,
            }
          ]
        })
  
    })
  
    it('should respond with status 401 when does not has Authorization', async () => {
      const result = await api.get("/hotels/1")
      expect(result.status).toBe(401)
  });
  
  it('should respond with status 401 when does not has token', async () => {
    const result = await api.get("/hotels/1").set({Authorization: "Bearer 000000000000"})
    expect(result.status).toBe(401)
  });
  
  let userId : number
  let token :string
  it('should respond with status 404 when user does not has enrollment', async () => {
    const signup = await api.post("/users").send({email: "test@test.com", password: "123456"})
    expect(signup.status).toBe(201)
  
    const signin = await api.post("/auth/sign-in").send({email: "test@test.com", password: "123456"})
    expect(signin.status).toBe(200)
   
     token = signin.body.token;
     
     userId = signin.body.user.id;
  
    const result = await api.get("/hotels/1").set({ Authorization: `Bearer ${token}` })
    expect(result.status).toBe(404)
  });
  let enrollmentId : number
  it('should respond with status 404 when user does not has ticket', async () => {
    const enrollment = await prisma.enrollment.create({
      data:{
        name: "test",
        cpf: "00000000000",
        birthday: "2000-01-01T00:00:00.000Z",
        phone:"00000000000",
        userId
      }
    });
  
    enrollmentId = enrollment.id
  
    const result = await api.get("/hotels/1").set({ Authorization: `Bearer ${token}`})
    expect(result.status).toBe(404)
    
  });
  
  it('should respond with status 402 when the ticket was not paid', async () => {
    const ticketType = await prisma.ticketType.create({
      data:{
        name: "test",
        price: 200,
        isRemote: true,
        includesHotel:false
      }
    });
  
    await prisma.ticket.create({
      data:{
        ticketTypeId: ticketType.id,
        enrollmentId,
        status:"RESERVED"
      }
    });
  
    const result = await api.get("/hotels/1").set({ Authorization: `Bearer ${token}`})
    expect(result.status).toBe(402)
    
  });
  
  it('should respond with status 402 when the ticket type is remote', async () => {
    await prisma.ticket.deleteMany()
    await prisma.ticketType.deleteMany()
    const ticketType = await prisma.ticketType.create({
      data:{
        name: "test",
        price: 200,
        isRemote: true,
        includesHotel:false
      }
    });
  
    await prisma.ticket.create({
      data:{
        ticketTypeId: ticketType.id,
        enrollmentId,
        status: "PAID"
      }


    });
    const result = await api.get("/hotels/1").set({ Authorization: `Bearer ${token}`})
    expect(result.status).toBe(402)
  });
  
  it('should respond with status 402 when the ticket type does not include hotel', async () => {
    await prisma.ticket.deleteMany()
    await prisma.ticketType.deleteMany()
  
    const ticketType = await prisma.ticketType.create({
      data:{
        name: "test",
        price: 200,
        isRemote: false,
        includesHotel:false
      }
    })
  
    await prisma.ticket.create({
      data:{
        ticketTypeId: ticketType.id,
        enrollmentId,
        status: "PAID"
      }
    });
    const result = await api.get("/hotels/1").set({ Authorization: `Bearer ${token}`})
    expect(result.status).toBe(402)
    
  });
  
  it('should respond with status 200 when all is ok', async () => {

    await prisma.ticket.deleteMany();
    await prisma.ticketType.deleteMany();
  
    const ticketType = await prisma.ticketType.create({
      data:{
        name: "test",
        price: 200,
        isRemote: false,
        includesHotel:true
      }
    })
  
    await prisma.ticket.create({
      data:{
        ticketTypeId: ticketType.id,
        enrollmentId,
        status: "PAID"
      }
    })
    const hotels = await prisma.hotel.findMany();
  
    const result = await api.get(`/hotels/${hotels[0].id}`).set({ Authorization: `Bearer ${token}`})
    expect(result.status).toBe(200)
    
    expect(result.body).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          image: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          Rooms: expect.arrayContaining([
            expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          capacity: expect.any(Number),
          hotelId: expect.any(Number),
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
            })
          ])
        })
    )
  });
 });