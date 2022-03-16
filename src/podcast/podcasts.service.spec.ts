import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Episode } from "./entities/episode.entity";
import { Podcast } from "./entities/podcast.entity";
import { PodcastsService } from "./podcasts.service";

const mockPodcastRepo = {
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
}

const mockEpisodeRepo = {
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
}

type MockPodcastRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>

describe('PodcastService', () => {
  let service: PodcastsService
  let podcastRepo: MockPodcastRepository
  let episoderepo: MockPodcastRepository

  const objEpisode: Episode = {
    id: 1,
    title: "",
    category: "",
    createdAt: new Date,
    updatedAt: new Date,
    podcast: {
      id: 1,
      title: "",
      category: "",
      rating: 2,
      createdAt: new Date,
      updatedAt: new Date,
      episodes: []
    }
  }
  const objPodcast: Podcast = {
    id: 1,
    title: "",
    category: "",
    rating: 2,
    createdAt: new Date,
    updatedAt: new Date,
    episodes: [objEpisode]
  }
  const InternalError = {
    ok: false,
    error: 'Internal server error occurred.',
  }
  beforeEach(async () => {
    jest.clearAllMocks()
    const module = await Test.createTestingModule({
      providers: [PodcastsService, {
        provide: getRepositoryToken(Podcast),
        useValue: mockPodcastRepo
      }, {
          provide: getRepositoryToken(Episode),
          useValue: mockEpisodeRepo
        }]
    }).compile()
    service = module.get(PodcastsService)
    podcastRepo = module.get(getRepositoryToken(Podcast))
    episoderepo = module.get(getRepositoryToken(Episode))
  })
  it("should defined", () => {
    expect(service).toBeDefined()
  })
  describe("getAllPodcasts", () => {
    it("should return fail", async () => {
      podcastRepo.find.mockRejectedValue(Error(""))
      const result = await service.getAllPodcasts()
      expect(result).toEqual(InternalError)
    })
    it("should return a podcast and ok", async () => {
      podcastRepo.find.mockReturnValue("I am Podcast")
      const result = await service.getAllPodcasts()
      expect(result).toEqual({
        ok: true,
        podcasts: "I am Podcast"
      })
    })
  })
  describe("createPodcast", () => {
    const createPodcaastInput = {
      title: "hoit",
      category: "hoithoit"
    }
    it("should fail create podcast", async () => {
      podcastRepo.create.mockRejectedValue(Error(" "))
      const result = await service.createPodcast(createPodcaastInput)
      expect(result).toEqual(InternalError)
    })
    it("should create a podcast and return id", async () => {
      podcastRepo.create.mockResolvedValue(createPodcaastInput)
      podcastRepo.save.mockReturnValue({ id: 1 })
      const result = await service.createPodcast(createPodcaastInput)
      expect(podcastRepo.create).toHaveBeenCalledWith(createPodcaastInput)
      expect(result).toEqual({ ok: true, id: 1 })
    })
  })
  describe("getPodcast", () => {
    const getPodcastInput = 1
    it("should fail with error", async () => {
      podcastRepo.findOne.mockRejectedValue(Error(" "))
      const result = await service.getPodcast(getPodcastInput)
      expect(result).toEqual(InternalError)
    })
    it("should podcast does not exist", async () => {
      podcastRepo.findOne.mockResolvedValue(false)
      const result = await service.getPodcast(getPodcastInput)
      expect(result).toEqual({
        ok: false,
        error: `Podcast with id ${getPodcastInput} not found`,
      })
    })
    it("should get a specific podcast", async () => {
      podcastRepo.findOne.mockResolvedValue(getPodcastInput)
      const result = await service.getPodcast(getPodcastInput)
      expect(result).toEqual({
        ok: true,
        podcast: getPodcastInput
      })
    })
  })
  describe("deletePodcast", () => {
    const deletePodcastInput = 1
    it("should fail with error", async () => {
      podcastRepo.delete.mockRejectedValue(Error(" "))
      const result = await service.deletePodcast(deletePodcastInput)
      expect(result).toEqual(InternalError)
    })
    it("should return false and error", async () => {
      jest.spyOn(service, 'getPodcast').mockReturnValue(Promise.resolve({ ok: false, error: "hoit" }))
      const result = await service.deletePodcast(deletePodcastInput)
      expect(result).toEqual({ ok: false, error: "hoit" })
    })
    it("should return ok", async () => {
      jest.spyOn(service, 'getPodcast').mockReturnValue(Promise.resolve({ ok: true, error: null }))
      podcastRepo.delete.mockResolvedValue({ id: deletePodcastInput })
      const result = await service.deletePodcast(deletePodcastInput)
      expect(result).toEqual({ ok: true })
    })
  })
  describe("updatePodcast", () => {
    const podcastInput = {
      id: 1,
      payload: {
        title: "hoit",
        category: "ho",
        rating: 2
      }
    }
    it("should fail with error", async () => {
      podcastRepo.save.mockRejectedValue(Error(" "))
      const result = await service.updatePodcast(podcastInput)
      expect(result).toEqual(InternalError)
    })
    it("should return false and error", async () => {
      jest.spyOn(service, "getPodcast").mockReturnValue(Promise.resolve({ ok: false, error: "hoit", podcast: null }))
      const result = await service.updatePodcast(podcastInput)
      expect(result).toEqual({ ok: false, error: "hoit" })
    })
    it("should return false and rating error", async () => {
      jest.spyOn(service, "getPodcast").mockReturnValue(Promise.resolve({ ok: true, error: null, podcast: null }))
      const result = await service.updatePodcast({ id: podcastInput.id, payload: { rating: 0 } })
      expect(result).toEqual({
        ok: false,
        error: 'Rating must be between 1 and 5.',
      })
    })
    it("should return ok", async () => {
      jest.spyOn(service, "getPodcast").mockReturnValue(Promise.resolve({ ok: true, error: null, podcast: null }))
      podcastRepo.save.mockResolvedValue(podcastInput)
      const result = await service.updatePodcast(podcastInput)
      expect(result).toEqual({ ok: true })
      expect(podcastRepo.save).toHaveBeenCalledTimes(1)
      expect(podcastRepo.save).toHaveBeenCalledWith(podcastInput.payload)
    })
  })
  describe("getEpisodes", () => {
    const getEpisodesInput = 1
    const podcastObj: Podcast = {
      id: 1,
      title: "",
      category: "",
      rating: 2,
      createdAt: new Date,
      updatedAt: new Date,
      episodes: []
    }
    it("should fail with error", async () => {
      jest.spyOn(service, "getPodcast").mockRejectedValue(Error(" "))
      const result = await service.getEpisodes(getEpisodesInput)
      expect(result).toEqual(InternalError)
    })
    it("should return false and error", async () => {
      jest.spyOn(service, "getPodcast").mockResolvedValue(Promise.resolve({ ok: false, error: "hoit" }))
      const result = await service.getEpisodes(getEpisodesInput)
      expect(result).toEqual({ ok: false, error: "hoit" })
    })
    it("should return true and episodes", async () => {
      jest.spyOn(service, "getPodcast").mockReturnValue(Promise.resolve({ ok: true, podcast: podcastObj }))
      const result = await service.getEpisodes(getEpisodesInput)
      expect(result).toEqual({ ok: true, episodes: podcastObj.episodes })
    })
  })
  describe("getEpisode", () => {
    const getEpisodeInput = { podcastId: 1, episodeId: 1 }
    it("should fail with error", async () => {
      jest.spyOn(service, "getEpisodes").mockRejectedValue(Error(""))
      const result = await service.getEpisode(getEpisodeInput)
      expect(result).toEqual(InternalError)
    })
    it("should return false and no podcast", async () => {
      jest.spyOn(service, "getEpisodes").mockResolvedValue({ ok: false, error: "no podcast" })
      const result = await service.getEpisode(getEpisodeInput)
      expect(result).toEqual({ ok: false, error: "no podcast" })
    })
    it("should return false and no episode ", async () => {
      jest.spyOn(service, "getEpisodes").mockResolvedValue(Promise.resolve({ ok: true, episodes: [] }))
      const result = await service.getEpisode(getEpisodeInput)
      expect(result).toEqual({
        ok: false,
        error: `Episode with id 1 not found in podcast with id 1`,
      })
    })
    it("should return true and return episodes", async () => {
      jest.spyOn(service, "getEpisodes").mockResolvedValue(Promise.resolve({ ok: true, episodes: [objEpisode] }))
      const result = await service.getEpisode(getEpisodeInput)
      expect(result).toEqual({
        ok: true,
        episode: objEpisode
      })
    })
  })
  describe("createEpisode", () => {
    const createEpisodeInput = {
      title: "",
      category: "",
      podcastId: 1,
    }
    it("should fail with error", async () => {
      jest.spyOn(service, "getPodcast").mockRejectedValue(Error(""))
      const result = await service.createEpisode(createEpisodeInput)
      expect(result).toEqual(InternalError)
    })
    it("should not find podcast, return false and error", async () => {
      jest.spyOn(service, "getPodcast").mockResolvedValue(Promise.resolve({ ok: false, error: "hoit" }))
      const result = await service.createEpisode(createEpisodeInput)
      expect(result).toEqual({ ok: false, error: "hoit" })
    })
    it("should return ok and episode id", async () => {
      jest.spyOn(service, "getPodcast").mockResolvedValue({ ok: true, podcast: objPodcast, error: null })
      episoderepo.create.mockReturnValue(objEpisode)
      episoderepo.save.mockReturnValue({ id: 1 })
      const result = await service.createEpisode(createEpisodeInput)
      expect(result).toEqual({ ok: true, id: 1 })
      expect(episoderepo.create).toHaveBeenCalledTimes(1)
      expect(episoderepo.create).toHaveBeenCalledWith({ title: "", category: "" })
      expect(episoderepo.save).toHaveBeenCalledTimes(1)
    })
  })
  describe("deleteEpisode", () => {
    const deleteEpisodeInput = {
      podcastId: 1,
      episodeId: 1
    }
    it("should fail with error", async () => {
      jest.spyOn(service, "getEpisode").mockRejectedValue(Error(""))
      const result = await service.deleteEpisode(deleteEpisodeInput)
      expect(result).toEqual(InternalError)
    })
    it("should not found a epiosde ,return false and error", async () => {
      jest.spyOn(service, "getEpisode").mockResolvedValue({ ok: false, error: "hoit" })
      const result = await service.deleteEpisode(deleteEpisodeInput)
      expect(result).toEqual({ ok: false, error: "hoit" })
    })
    it("should return ok and delete", async () => {
      jest.spyOn(service, "getEpisode").mockReturnValue(Promise.resolve({ ok: true, episode: objEpisode }))
      episoderepo.delete.mockReturnValue(true)
      const result = await service.deleteEpisode(deleteEpisodeInput)
      expect(result).toEqual({ ok: true })
    })
  })
  describe("updateEpisode", () => {
    const updateEpisodeInput = {
      podcastId: 1,
      episodeId: 1,
      title: "",
      category: "",
    }
    it("should fail with error", async () => {
      jest.spyOn(service, "getEpisode").mockRejectedValue(Error(""))
      const result = await service.updateEpisode(updateEpisodeInput)
      expect(result).toEqual(InternalError)
    })
    it("should does not exist podcast, return fail and error", async () => {
      jest.spyOn(service, "getEpisode").mockResolvedValue(Promise.resolve({ ok: false, error: "hoit" }))
      const result = await service.updateEpisode(updateEpisodeInput)
      expect(result).toEqual({ ok: false, error: "hoit" })
    })
    it("should return true", async () => {
      jest.spyOn(service, "getEpisode").mockResolvedValue(Promise.resolve({ ok: true }))
      episoderepo.save.mockReturnValue(true)
      const result = await service.updateEpisode(updateEpisodeInput)
      expect(result).toEqual({ ok: true })
    })
  })
});
