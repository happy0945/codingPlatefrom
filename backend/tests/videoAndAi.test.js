// ============================================================
// Video Controller Tests — generateUploadSignature, deleteVideo
// AI Controller Tests  — solveDoubt
// ============================================================

// ─── VIDEO ──────────────────────────────────────────────────
const { generateUploadSignature, deleteVideo } = require('../src/controllers/videoSection');
const Problem = require('../src/models/problem');
const SolutionVideo = require('../src/models/solutionVideo');

// Mock cloudinary at module level
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    utils: {
      api_sign_request: jest.fn().mockReturnValue('mock_signature'),
    },
    api: {
      resource: jest.fn(),
    },
    uploader: {
      destroy: jest.fn(),
    },
    image: jest.fn().mockReturnValue('<img />'),
  },
}));
jest.mock('../src/models/problem');
jest.mock('../src/models/solutionVideo');

const cloudinary = require('cloudinary').v2;

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe('generateUploadSignature()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return 404 if problem is not found', async () => {
    Problem.findById.mockResolvedValue(null);
    const req = { params: { problemId: 'nonexistent' }, result: { _id: 'admin1' } };
    const res = mockRes();
    await generateUploadSignature(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Problem not found' });
  });

  it('should return signature payload when problem exists', async () => {
    Problem.findById.mockResolvedValue({ _id: 'prob1' });
    const req = { params: { problemId: 'prob1' }, result: { _id: 'admin1' } };
    const res = mockRes();
    await generateUploadSignature(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        signature: 'mock_signature',
        api_key: process.env.CLOUDINARY_API_KEY,
      })
    );
  });
});

describe('deleteVideo()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return 404 if video not found for problem', async () => {
    SolutionVideo.findOneAndDelete.mockResolvedValue(null);
    const req = { params: { problemId: 'prob1' }, result: { _id: 'admin1' } };
    const res = mockRes();
    await deleteVideo(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Video not found' });
  });

  it('should delete video from Cloudinary and DB and return 200', async () => {
    SolutionVideo.findOneAndDelete.mockResolvedValue({
      _id: 'vid1',
      cloudinaryPublicId: 'leetcode-solutions/prob1/admin1_123',
    });
    cloudinary.uploader.destroy.mockResolvedValue({ result: 'ok' });

    const req = { params: { problemId: 'prob1' }, result: { _id: 'admin1' } };
    const res = mockRes();
    await deleteVideo(req, res);

    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
      'leetcode-solutions/prob1/admin1_123',
      { resource_type: 'video', invalidate: true }
    );
    expect(res.json).toHaveBeenCalledWith({ message: 'Video deleted successfully' });
  });

  it('should return 500 if Cloudinary throws during deletion', async () => {
    SolutionVideo.findOneAndDelete.mockResolvedValue({
      _id: 'vid1',
      cloudinaryPublicId: 'some/public_id',
    });
    cloudinary.uploader.destroy.mockRejectedValue(new Error('Cloudinary error'));

    const req = { params: { problemId: 'prob1' }, result: { _id: 'admin1' } };
    const res = mockRes();
    await deleteVideo(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to delete video' });
  });
});

// ─── AI DOUBT SOLVER ─────────────────────────────────────────
const solveDoubt = require('../src/controllers/solveDoubt');
const { GoogleGenAI } = require('@google/genai');

jest.mock('@google/genai');

describe('solveDoubt()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return 201 with AI response text on success', async () => {
    const mockGenerateContent = jest.fn().mockResolvedValue({
      text: 'Use a hashmap to store indices.',
    });
    GoogleGenAI.mockImplementation(() => ({
      models: { generateContent: mockGenerateContent },
    }));

    const req = {
      body: {
        messages: [{ role: 'user', parts: [{ text: 'Give me a hint' }] }],
        title: 'Two Sum',
        description: 'Find two indices that sum to target',
        testCases: '[1,2,3]',
        startCode: 'function twoSum(){}',
      },
    };
    const res = mockRes();

    await solveDoubt(req, res);

    // Allow async main() inside controller to resolve
    await new Promise((r) => setTimeout(r, 50));

    expect(mockGenerateContent).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('should return 500 if Gemini API throws', async () => {
    GoogleGenAI.mockImplementation(() => {
      throw new Error('API key invalid');
    });

    const req = {
      body: {
        messages: [],
        title: 'Two Sum',
        description: '',
        testCases: '',
        startCode: '',
      },
    };
    const res = mockRes();
    await solveDoubt(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});
