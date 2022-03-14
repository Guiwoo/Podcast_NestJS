import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { JwtService } from "src/jwt/jwt.service";
import { Repository } from "typeorm";
import { User, UserRole } from "./entities/user.entity";
import { UsersService } from "./users.service";

const mockUserRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  findOneOrFail: jest.fn(),
}

const mockJwtRepo = {
  sign: jest.fn()
}

type MockUserRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>

describe('UsersService', () => {
  let service: UsersService
  let userRepo: MockUserRepository

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [UsersService, {
        provide: getRepositoryToken(User),
        useValue: mockUserRepo
      }, {
          provide: JwtService,
          useValue: mockJwtRepo
        }]
    }).compile()
    service = module.get(UsersService)
    userRepo = module.get(getRepositoryToken(User));
  })
  it("should defined", () => {
    expect(service).toBeDefined()
  })
  describe("createAccount", () => {
    const createArgs = {
      email: '',
      password: '',
      role: UserRole.Host
    }
    it("should fail if user exists", async () => {
      userRepo.findOne.mockResolvedValue({
        id: 1,
        email: ""
      });
      const result = await service.createAccount(createArgs)
      expect(result).toMatchObject({
        ok: false, error: `There is a user with that email already`
      })
    })
    it("should fail if didn't get enough data", async () => {
      userRepo.findOne.mockReturnValue(false)
      userRepo.save.mockRejectedValue(Error(''))
      const result = await service.createAccount(createArgs)
      expect(result).toEqual({
        ok: false,
        error: 'Could not create account',
      })
    })
    it("should create an account", async () => {
      userRepo.findOne.mockReturnValue(false)
      userRepo.create.mockReturnValue(true)
      userRepo.save.mockReturnValue(true)
      const result = await service.createAccount(createArgs)
      expect(result).toEqual({ ok: true, error: null })
    })
  })
  it.todo("login")
  it.todo("findById")
  it.todo("editProfile")
});
