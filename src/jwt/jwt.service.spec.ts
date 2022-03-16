import { Test } from "@nestjs/testing";
import { CONFIG_OPTIONS } from "./jwt.constants";
import { JwtService } from "./jwt.service";
import * as jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken', () => {
  return {
    sign: jest.fn(() => "token"),
    verify: jest.fn(() => ({ id: 1 }))
  }
})

describe('JwtService', () => {
  let service: JwtService
  beforeEach(async () => {
    jest.clearAllMocks()
    const module = await Test.createTestingModule({
      providers: [JwtService, {
        provide: CONFIG_OPTIONS,
        useValue: { privateKey: "test" }
      }]
    }).compile()
    service = module.get(JwtService)
  })

  it("should define", () => {
    expect(service).toBeDefined()
  })
  describe("sign", () => {
    it("should return a signed token", () => {
      const token = service.sign(1)
      expect(token).toEqual("token")
      expect(jwt.sign).toHaveBeenCalledWith({ id: 1 }, "test");
      expect(jwt.sign).toHaveBeenCalledTimes(1);
    })
  })
  describe("verify", () => {
    it("should return the decoded token", () => {
      const token = service.verify("token")
      expect(token).toEqual({ id: 1 })
      expect(jwt.verify).toHaveBeenCalledTimes(1)
      expect(jwt.verify).toHaveBeenCalledWith("token", "test")
    })
  })
});
