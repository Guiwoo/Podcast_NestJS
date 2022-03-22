import { Test } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Podcast } from 'src/podcast/entities/podcast.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getConnection, Repository } from 'typeorm';

describe('App (e2e)', () => {
  let app: INestApplication;
  let podcastRepo: Repository<Podcast>;

  const baseTest = () => request(app.getHttpServer()).post("/graphql")

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    podcastRepo = moduleFixture.get(getRepositoryToken(Podcast))
    await app.init();
  });

  afterAll(async () => {
    await getConnection().dropDatabase()
    app.close()
  })

  describe('Podcasts Resolver', () => {
    describe('getAllPodcasts', () => {
      it("should show all podcasts list", async () => {
        return baseTest().send({
          query: `
          {
            getAllPodcasts{
              ok
              error
              podcasts{
                id
              }
            }
          }
          `
        }).expect(200)
      })
      it("should fail get all podcast list", async () => {
        jest.spyOn(podcastRepo, "find").mockRejectedValue(new Error())
        return baseTest().send({
          query: `
          {
            getAllPodcasts{
              ok
              error
              podcasts{
                id
              }
            }
          }
          `
        }).expect(200)
          .expect(res => expect(res.body.data.getAllPodcasts.error).toEqual(expect.any(String)))
      })
    });
    describe('createPodcast', () => {
      it("should create a Podcast", async () => {
        return baseTest().send({
          query: `mutation{
            createPodcast(input:{
              title:"test",
              category:"hoit"
            }){
              ok
              error
            }
          }`
        }).expect(200)
          .expect(res => expect(res.body.data.createPodcast.ok).toBe(true))
      })
      it("should fail create a Podcast", async () => {
        jest.spyOn(podcastRepo, "save").mockRejectedValue(new Error())
        return baseTest().send({
          query: `mutation{
            createPodcast(input:{
              title:"test",
              category:"hoit"
            }){
              ok
              error
            }
          }`
        }).expect(200).expect(res => expect(res.body.data.createPodcast.error).toEqual(expect.any(String)))
      });
    })
    describe('getPodcast', () => {
      // it("should find a podcast")
    });
    it.todo('getEpisodes');
    it.todo('deletePodcast');
    it.todo('updatePodcast');
    it.todo('createEpisode');
    it.todo('updateEpisode');
    it.todo('deleteEpisode');
  });
  describe('Users Resolver', () => {
    it.todo('me');
    it.todo('seeProfile');
    it.todo('createAccount');
    it.todo('login');
    it.todo('editProfile');
  });
});
