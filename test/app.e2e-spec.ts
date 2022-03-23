import { Test } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Podcast } from 'src/podcast/entities/podcast.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getConnection, Repository } from 'typeorm';
import { PodcastsService } from 'src/podcast/podcasts.service';
import { Episode } from 'src/podcast/entities/episode.entity';

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
  createEpisode: "",
  getEpisodes: "",
  updatePodcast: "",
  updateEpisode: "",
}

const mockedRepository = () => ({
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
})

describe('App (e2e)', () => {
  let app: INestApplication;
  let podService: PodcastsService
  let episodeRepo: Repository<Episode>
  let podcastRepo: Repository<Podcast>;

  const baseTest = (query: string) => request(app.getHttpServer()).post("/graphql").send({ query })

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
    episodeRepo = moduleFixture.get(getRepositoryToken(Episode))

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
    const wrongId = 666
    describe('getAllPodcasts', () => {
      it("should show all podcasts list", async () => {
        return baseTest(QueryPodcastObj.getAllPodcasts).expect(200)
      })
      it("should fail get all podcast list", async () => {
        jest.spyOn(podcastRepo, "find").mockRejectedValue(new Error())
        return baseTest(QueryPodcastObj.getAllPodcasts).expect(200)
          .expect(res => expect(res.body.data.getAllPodcasts.error).toEqual(expect.any(String)))
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
        return baseTest(QueryPodcastObj.createPodcast).expect(200).expect(res => expect(res.body.data.createPodcast.error).toEqual(expect.any(String)))
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
            const { body: { data: { getPodcast: { ok, error, podcast } } } } = res
            expect(ok).toBe(false)
            expect(error).toEqual('Internal server error occurred.')
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
            expect(ok).toBe(true)
            expect(error).toBe(null)
            expect(podcast).toEqual(expect.any(Object))
          })
      })
    });
    describe('createEpisode', () => {
      const getVar = (podcastId) => QueryPodcastObj.createEpisode = `mutation{
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
            expect(ok).toBe(false)
            expect(error).toEqual(expect.any(String))
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
          expect(ok).toBe(true)
          expect(error).toBe(null)
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
          expect(ok).toBe(true)
          expect(error).toBe(null)
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
          expect(ok).toBe(false)
          expect(error).toEqual(expect.any(String))
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
          expect(ok).toBe(true)
          expect(error).toBe(null)
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
          expect(ok).toBe(false)
          expect(error).toEqual(expect.any(String))
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
          expect(ok).toBe(true)
          expect(error).toBe(null)
        })
      })
    });
    it.todo('deleteEpisode');
    it.todo('deletePodcast');
  });
  describe('Users Resolver', () => {
    it.todo('me');
    it.todo('seeProfile');
    it.todo('createAccount');
    it.todo('login');
    it.todo('editProfile');
  });
});
