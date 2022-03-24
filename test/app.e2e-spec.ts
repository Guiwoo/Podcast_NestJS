import { Test } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Podcast } from 'src/podcast/entities/podcast.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getConnection, Repository } from 'typeorm';
import { PodcastsService } from 'src/podcast/podcasts.service';
import { Episode } from 'src/podcast/entities/episode.entity';
import { User } from 'src/users/entities/user.entity';
import { getVariableValues } from 'graphql/execution/values';


const QueryPodcastObj = {
  getAllPodcasts: `
  {
    getAllPodcasts{
      ok
      error
      podcasts{
        id
      }
    }
  }
  `,
  createPodcast: `mutation{
    createPodcast(input:{
      title:"test",
      category:"hoit"
    }){
      ok
      error
    }
  }`,
  getPodcast: ``,
}

const mockedRepository = () => ({
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
})

const utilsTest = {
  serverErrorExpect: (ok: boolean, error: string) => {
    expect(ok).toBe(false)
    expect(error).toEqual(expect.any(String))
  },
  trueNullExpect: (ok: boolean, error: string) => {
    expect(ok).toBe(true)
    expect(error).toBe(null)
  }
}

describe('App (e2e)', () => {
  let app: INestApplication;
  let podService: PodcastsService
  let podcastRepo: Repository<Podcast>;
  let userRepo: Repository<User>;

  const baseStructure = () => request(app.getHttpServer()).post("/graphql")
  const baseTest = (query: string) => baseStructure().send({ query })
  const privateTest = (query: string, token: string) => baseStructure().set("x-jwt", token).send({ query })
  const wrongId = 666

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
      providers: [PodcastsService, {
        provide: getRepositoryToken(Podcast),
        useValue: mockedRepository()
      }, {
          provide: getRepositoryToken(Episode),
          useValue: mockedRepository()
        }]
    }).compile();
    app = moduleFixture.createNestApplication();

    podcastRepo = moduleFixture.get(getRepositoryToken(Podcast))
    userRepo = moduleFixture.get(getRepositoryToken(User))

    podService = moduleFixture.get(PodcastsService)

    await app.init();
  });

  afterEach(async () => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  afterAll(async () => {
    await getConnection().dropDatabase()
    app.close()
  })

  describe('Podcasts Resolver', () => {
    let podcastId: number
    let episodeId: number
    describe('getAllPodcasts', () => {
      it("should show all podcasts list", async () => {
        return baseTest(QueryPodcastObj.getAllPodcasts).expect(200).expect(res => {
          const { body: { data: { getAllPodcasts: { ok, error } } } } = res
          utilsTest.trueNullExpect(ok, error)
        })
      })
      it("should fail get all podcast list", async () => {
        jest.spyOn(podcastRepo, "find").mockRejectedValue(new Error())
        return baseTest(QueryPodcastObj.getAllPodcasts).expect(200)
          .expect(res => {
            const { body: { data: { getAllPodcasts: { ok, error } } } } = res
            utilsTest.serverErrorExpect(ok, error)
          })
      })
      jest.clearAllMocks()
    });
    describe('createPodcast', () => {
      it("should create a Podcast", async () => {
        return baseTest(QueryPodcastObj.createPodcast).expect(200)
          .expect(res => expect(res.body.data.createPodcast.ok).toBe(true))
      })
      it("should fail create a Podcast", async () => {
        jest.spyOn(podcastRepo, "save").mockRejectedValue(new Error())
        return baseTest(QueryPodcastObj.createPodcast).expect(200).expect(res => {
          const { body: { data: { createPodcast: { ok, error } } } } = res
          utilsTest.serverErrorExpect(ok, error)
        })
      });
    })
    describe('getPodcast', () => {
      const getOneVar = (podcastId) => `{
        getPodcast(input:{
          id:${podcastId}
        }){
          ok
          error
          podcast{
            id
          }
        }
      }`
      beforeAll(async () => {
        const [podcast] = await podcastRepo.find()
        podcastId = podcast.id
        QueryPodcastObj.getPodcast = getOneVar(podcastId)
      })
      it("should failed with error ", () => {
        jest.spyOn(podcastRepo, "findOne").mockRejectedValue(new Error())
        return baseTest(QueryPodcastObj.getPodcast).expect(200)
          .expect((res) => {
            const { body: { data: { getPodcast: { ok, error } } } } = res
            utilsTest.serverErrorExpect(ok, error)
          })
      })
      it("should not find podcast id ", () => {
        return baseTest(getOneVar(wrongId)).expect(200)
          .expect((res) => {
            const { body: { data: { getPodcast: { ok, error } } } } = res
            expect(ok).toBe(false)
            expect(error).toEqual(`Podcast with id ${wrongId} not found`)
          })
      })
      it("should return a podcast with true ", () => {
        return baseTest(QueryPodcastObj.getPodcast).expect(200)
          .expect(res => {
            const { body: { data: { getPodcast: { ok, error, podcast } } } } = res
            utilsTest.trueNullExpect(ok, error)
            expect(podcast).toEqual(expect.any(Object))
          })
      })
    });
    describe('createEpisode', () => {
      const getVar = (podcastId) => `mutation{
        createEpisode(input:{
          title:"Um?"
          category:"holy"
          podcastId:${podcastId}
        }){
          ok
          error
          id
        }
      }`
      it("should fail with an error", () => {
        jest.spyOn(podService, "getPodcast").mockRejectedValue(new Error(""))
        return baseTest(getVar(podcastId)).expect(200)
          .expect(res => {
            const { body: { data: { createEpisode: { ok, error } } } } = res
            utilsTest.serverErrorExpect(ok, error)
          })
      })
      it("should failed with doesn't exist podcast", () => {
        return baseTest(getVar(wrongId)).expect(200)
          .expect(res => {
            const { body: { data: { createEpisode: { ok, error } } } } = res
            expect(ok).toBe(false)
            expect(error).toEqual(`Podcast with id ${wrongId} not found`)
          })
      })
      it("should pass create episode", () => {
        return baseTest(getVar(podcastId)).expect(200).expect(res => {
          const { body: { data: { createEpisode: { ok, error, id } } } } = res
          episodeId = id
          utilsTest.trueNullExpect(ok, error)
        })
      })
    });
    describe('getEpisodes', () => {
      const getVar = (podcastId) => `{
        getEpisodes(input:{
          id:${podcastId}
        }){
          ok
          error
          episodes{
            id
          }
        }
      }`
      it("should failed with doesn't exist podcast", () => {
        return baseTest(getVar(wrongId)).expect(200).expect(res => {
          const { body: { data: { getEpisodes: { ok, error } } } } = res
          expect(ok).toBe(false)
          expect(error).toBe(`Podcast with id ${wrongId} not found`)
        })
      })
      it("should pass get Episodes", () => {
        return baseTest(getVar(podcastId)).expect(200).expect(res => {
          const { body: { data: { getEpisodes: { ok, error, episodes } } } } = res
          utilsTest.trueNullExpect(ok, error)
          expect(episodes).toEqual(expect.any(Array))
        })
      })
    });
    describe('updatePodcast', () => {
      const getVar = (podcastId, rating) => `mutation{
        updatePodcast(input:{
          id:${podcastId}
          payload:{
            title:"HolyWak"
            category:"Testing"
            rating:${rating}
          }
        }){
          ok
          error
        }
      }`
      it("should fail with server Error", () => {
        jest.spyOn(podService, "getPodcast").mockRejectedValue(new Error(""))
        return baseTest(getVar(1, 2)).expect(200).expect(res => {
          const { body: { data: { updatePodcast: { ok, error } } } } = res
          utilsTest.serverErrorExpect(ok, error)
        })
      })
      it("should fail with doesn't exist podcast", () => {
        return baseTest(getVar(wrongId, 2)).expect(200).expect(res => {
          const { body: { data: { updatePodcast: { ok, error } } } } = res
          expect(ok).toBe(false)
          expect(error).toBe(`Podcast with id ${wrongId} not found`)
        })
      })
      it("should fail with over rating", () => {
        return baseTest(getVar(podcastId, 6)).expect(200).expect(res => {
          const { body: { data: { updatePodcast: { ok, error } } } } = res
          expect(ok).toBe(false)
          expect(error).toBe('Rating must be between 1 and 5.')
        })
      })
      it("should update the podcast", () => {
        return baseTest(getVar(podcastId, 5)).expect(200).expect(res => {
          const { body: { data: { updatePodcast: { ok, error } } } } = res
          utilsTest.trueNullExpect(ok, error)
        })
      })
    });
    describe('updateEpisode', () => {
      const getVar = (podcastId, episodeId) => `mutation{
        updateEpisode(input:{
          title:"HolyWak"
          category:"Houuuu"
          podcastId:${podcastId}
          episodeId:${episodeId}
        }){
          ok
          error
        }
      }`
      it("should fail with serever Error", () => {
        jest.spyOn(podService, "getEpisode").mockRejectedValue(new Error(""))
        return baseTest(getVar(podcastId, episodeId)).expect(200).expect(res => {
          const { body: { data: { updateEpisode: { ok, error } } } } = res
          utilsTest.serverErrorExpect(ok, error)
        })
      })
      it("should fail with wrong podcast and episode", () => {
        return baseTest(getVar(wrongId, wrongId)).expect(200).expect(res => {
          const { body: { data: { updateEpisode: { ok, error } } } } = res
          expect(ok).toBe(false)
          expect(error).toBe(`Podcast with id ${wrongId} not found`)
        })
      })
      it("should update episode", () => {
        return baseTest(getVar(podcastId, episodeId)).expect(200).expect(res => {
          const { body: { data: { updateEpisode: { ok, error } } } } = res
          utilsTest.trueNullExpect(ok, error)
        })
      })
    });
    describe('deleteEpisode', () => {
      const getVar = (podcastId, episodeId) => `mutation{
        deleteEpisode(input:{
          podcastId:${podcastId}
          episodeId:${episodeId}
        }){
          ok
          error
        }
      }`
      it("should fail sever error", () => {
        jest.spyOn(podService, "getEpisode").mockRejectedValue(new Error(""))
        return baseTest(getVar(podcastId, episodeId)).expect(200).expect(res => {
          const { body: { data: { deleteEpisode: { ok, error } } } } = res
          utilsTest.serverErrorExpect(ok, error)
        })
      })
      it("should fail with doesn't exsist podcast or episode", () => {
        return baseTest(getVar(wrongId, wrongId)).expect(200).expect(res => {
          const { body: { data: { deleteEpisode: { ok, error } } } } = res
          expect(ok).toBe(false)
          expect(error).toEqual(expect.any(String))
        })
      })
      it("should delete a episode", () => {
        return baseTest(getVar(podcastId, episodeId)).expect(200).expect(res => {
          const { body: { data: { deleteEpisode: { ok, error } } } } = res
          utilsTest.trueNullExpect(ok, error)
        })
      })
    });
    describe('deletePodcast', () => {
      const getVar = (podcastId) => `mutation{
        deletePodcast(input:{
          id:${podcastId}
        }){
          ok
          error
        }
      }`
      it("should fail sever error", () => {
        jest.spyOn(podService, "getPodcast").mockRejectedValue(new Error(""))
        return baseTest(getVar(podcastId)).expect(200).expect(res => {
          const { body: { data: { deletePodcast: { ok, error } } } } = res
          utilsTest.serverErrorExpect(ok, error)
        })
      })
      it("should fail with doesn't exsist podcast or episode", () => {
        return baseTest(getVar(wrongId)).expect(200).expect(res => {
          const { body: { data: { deletePodcast: { ok, error } } } } = res
          expect(ok).toBe(false)
          expect(error).toEqual(expect.any(String))
        })
      })
      it("should delete a podcast", () => {
        return baseTest(getVar(podcastId)).expect(200).expect(res => {
          const { body: { data: { deletePodcast: { ok, error } } } } = res
          utilsTest.trueNullExpect(ok, error)
        })
      })
    });
  });

  describe('Users Resolver', () => {
    const wrongInfo = {
      email: "hoit@hoit.com",
      password: "666"
    }
    const uInfo = {
      email: "test@test.com",
      password: "123",
    }
    let gotToken: string
    let userId: number

    describe('createAccount', () => {
      const getVar = (email: string, password: string) => `mutation{
        createAccount(input:{
          email:"${email}"
          password:"${password}"
          role:Host
        }){
          ok
          error
        }
      }`
      it("fail with serverError", () => {
        jest.spyOn(userRepo, "findOne").mockRejectedValue(new Error(""))
        return baseTest(getVar(uInfo.email, uInfo.password)).expect(200).expect(res => {
          const { body: { data: { createAccount: { ok, error } } } } = res
          utilsTest.serverErrorExpect(ok, error)
        })
      })
      it("create an account", () => {
        return baseTest(getVar(uInfo.email, uInfo.password)).expect(200).expect((res) => {
          const { body: { data: { createAccount: { ok, error } } } } = res
          utilsTest.trueNullExpect(ok, error)
        })
      })
      it("fail with existing user email", () => {
        return baseTest(getVar(uInfo.email, uInfo.password)).expect(200).expect((res) => {
          const { body: { data: { createAccount: { ok, error } } } } = res
          expect(ok).toBe(false)
          expect(error).toBe(`There is a user with that email already`)
        })
      })
    });

    describe('login', () => {
      const getVar = (email: string, password: string) => `mutation{
        login(input:{
          email:"${email}"
          password:"${password}"
        }){
          ok
          error
          token
      }
      }`
      it("shoudl fail with error", () => {
        jest.spyOn(userRepo, "findOne").mockRejectedValue(new Error(""))
        return baseTest(getVar(uInfo.email, uInfo.password)).expect(200)
          .expect(res => {
            const { body: { data: { login: { ok, error } } } } = res
            expect(ok).toBe(false)
            expect(res.body.errors).toEqual(expect.any(Array))
          })
      })
      it("should fail with user not found", () => {
        return baseTest(getVar(wrongInfo.email, wrongInfo.password)).expect(200)
          .expect((res) => {
            const { body: { data: { login: { ok, error } } } } = res
            expect(ok).toBe(false)
            expect(error).toBe("User not found")
          })
      })
      it("should fail with wrong password", () => {
        return baseTest(getVar(uInfo.email, wrongInfo.password)).expect(200)
          .expect(res => {
            const { body: { data: { login: { ok, error } } } } = res
            expect(ok).toBe(false)
            expect(error).toBe("Wrong password")
          })
      })
      it("should logged in and return token!", () => {
        return baseTest(getVar(uInfo.email, uInfo.password)).expect(200)
          .expect(res => {
            const { body: { data: { login: { ok, error, token } } } } = res
            gotToken = token
            expect(ok).toBe(true)
            expect(error).toBe(null)
            expect(token).toEqual(expect.any(String))
          })
      })
    });
    describe('me', () => {
      const getVar = () => `{
        me{
          email
        }
      }`
      it("logged in User", () => {
        return privateTest(getVar(), gotToken).expect(200)
          .expect(res => {
            const { body: { data: { me: { email } } } } = res
            expect(email).toBe(uInfo.email)
          })
      })
      it("return error with didn't login", () => {
        return privateTest(getVar(), "hoithoithoit").expect(200).expect(res => {
          const { body: { errors } } = res
          expect(errors[0].message).toBe("Forbidden resource")
        })
      })
    });
    describe('seeProfile', () => {
      const getVar = (userId: number) => `{
        seeProfile(userId:${userId}){
          ok
          error
          user{
            email
          }
        }
      }`
      beforeAll(async () => {
        const [user] = await userRepo.find()
        userId = user.id
      })
      it("should return User Not Found", () => {
        return privateTest(getVar(wrongId), gotToken).expect(200).expect(res => {
          const { body: { data: { seeProfile: { ok, error, user } } } } = res
          expect(ok).toBe(false)
          expect(error).toBe("User Not Found")
          expect(user).toBe(null)
        })
      })
      it("should return Found user and return", () => {
        return privateTest(getVar(userId), gotToken).expect(200).expect(res => {
          const { body: { data: { seeProfile: { ok, error, user } } } } = res
          expect(ok).toBe(true)
          expect(user.email).toBe(uInfo.email)
        })
      })
    });
    it.todo('editProfile');
  });
});
