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
  sign: jest.fn(() => "Signed")
}

type MockUserRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>

describe('UsersService', () => {
  let service: UsersService
  let userRepo: MockUserRepository
  let jwtService: JwtService

  beforeEach(async () => {
    jest.clearAllMocks()
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
    jwtService = module.get(JwtService)
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
  describe("login", () => {
    const loginArgs = { email: "", password: "" }
    it("should raise an error", async () => {
      userRepo.findOne.mockRejectedValue(new Error())
      const result = await service.login(loginArgs)
      expect(result).toEqual({ ok: false, error: "Can't login" })
    })
    it("should not found a user", async () => {
      userRepo.findOne.mockReturnValue(false)
      const result = await service.login(loginArgs)
      expect(result).toEqual({
        ok: false,
        error: 'User not found',
      })
    })
    it("should return a wrong password", async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(false))
      }
      userRepo.findOne.mockResolvedValue(mockedUser)
      const result = await service.login(loginArgs)
      expect(result).toEqual({
        ok: false,
        error: 'Wrong password',
      })
    })
    it("should login and give token", async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true))
      }
      userRepo.findOne.mockResolvedValue(mockedUser)
      const result = await service.login(loginArgs)
      expect(jwtService.sign).toHaveBeenCalledTimes(1)
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number))
      expect(result).toEqual({ ok: true, token: "Signed" })
    })
  })
  describe("findById", () => {
    it("should raise an error", async () => {
      userRepo.findOneOrFail.mockRejectedValue(Error(''))
      const result = await service.findById(1)
      expect(result).toEqual({
        ok: false,
        error: 'User Not Found',
      })
    })
    it("should find a user", async () => {
      userRepo.findOneOrFail.mockResolvedValue({ email: "hoit", role: "Host" })
      const result = await service.findById(1)
      expect(result).toEqual({
        ok: true,
        user: { email: "hoit", role: "Host" },
      })
    })
  })
  describe("editProfile", () => {
    const oldUser = {
      email: "hoit@com",
      password: "123"
    }
    const editProfileArgs = {
      email: 'n@n.com', password: "123"
    };
    it("should change the User Email", async () => {
      userRepo.findOne.mockResolvedValue(oldUser)
      const result = await service.editProfile(1, { email: editProfileArgs.email })
      expect(userRepo.findOne).toHaveBeenCalledTimes(1)
      expect(userRepo.save).toHaveBeenCalledWith({
        email: editProfileArgs.email,
        password: oldUser.password
      })
      expect(userRepo.save).toHaveBeenCalledTimes(1)
    })
    it("should change the User Password", async () => {
      userRepo.findOne.mockResolvedValue(oldUser)
      const result = await service.editProfile(1, { password: editProfileArgs.password })
      expect(userRepo.findOne).toHaveBeenCalledTimes(1)
      expect(userRepo.findOne).toHaveBeenCalledWith(1)
      expect(userRepo.save).toHaveBeenCalledTimes(1)
      expect(userRepo.save).toHaveBeenCalledWith({
        email: oldUser.email,
        password: editProfileArgs.password
      })
      expect(result).toEqual({ ok: true })
    })
    it("should raise an error", async () => {
      userRepo.findOne.mockRejectedValue(Error(" "))
      const result = await service.editProfile(1, { email: "lala@com" })
      expect(result).toEqual({
        ok: false,
        error: 'Could not update profile',
      })
    })
  })
});
