// ============================================================
// Problem Controller Tests — createProblem, updateProblem,
// deleteProblem, getProblemById, getAllProblem,
// solvedAllProblembyUser, submittedProblem
// ============================================================
const {
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemById,
  getAllProblem,
  solvedAllProblembyUser,
  submittedProblem,
} = require('../src/controllers/userProblem');
const Problem = require('../src/models/problem');
const Submission = require('../src/models/submission');
const User = require('../src/models/user');
const SolutionVideo = require('../src/models/solutionVideo');
const { submitBatch, submitToken, getLanguageById } = require('../src/utils/problemUtility');

jest.mock('../src/models/problem');
jest.mock('../src/models/submission');
jest.mock('../src/models/user');
jest.mock('../src/models/solutionVideo');
jest.mock('../src/utils/problemUtility');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

const SAMPLE_PROBLEM = {
  _id: 'prob1',
  title: 'Two Sum',
  description: 'Find indices of two numbers that add up to target',
  difficulty: 'Easy',
  tags: 'Array',
  visibleTestCases: [{ input: '[2,7,11,15]\n9', output: '[0,1]' }],
  hiddenTestCases: [{ input: '[3,2,4]\n6', output: '[1,2]' }],
  startCode: [],
  referenceSolution: [
    { language: 'javascript', completeCode: 'function twoSum(){}' },
  ],
};

// ─── CREATE PROBLEM ─────────────────────────────────────────
describe('createProblem()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return 400 if reference solution fails test cases', async () => {
    getLanguageById.mockReturnValue(102);
    submitBatch.mockResolvedValue([{ token: 'tok1' }]);
    submitToken.mockResolvedValue([
      { status_id: 4, status: { description: 'Wrong Answer' } }, // fails
    ]);

    const req = { body: { ...SAMPLE_PROBLEM }, result: { _id: 'admin1' } };
    const res = mockRes();
    await createProblem(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Error Occured');
  });

  it('should save problem to DB and return 201 when all reference solutions pass', async () => {
    getLanguageById.mockReturnValue(102);
    submitBatch.mockResolvedValue([{ token: 'tok1' }]);
    submitToken.mockResolvedValue([{ status_id: 3 }]); // Accepted
    Problem.create.mockResolvedValue({ _id: 'prob1', title: 'Two Sum' });

    const req = { body: { ...SAMPLE_PROBLEM }, result: { _id: 'admin1' } };
    const res = mockRes();
    await createProblem(req, res);

    expect(Problem.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith('Problem Saved Successfully');
  });
});

// ─── UPDATE PROBLEM ─────────────────────────────────────────
describe('updateProblem()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return 404 if problem is not found', async () => {
    Problem.findById.mockResolvedValue(null);
    const req = { params: { id: 'nonexistent' }, body: SAMPLE_PROBLEM };
    const res = mockRes();
    await updateProblem(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('should update problem and return 200 when solution passes', async () => {
    Problem.findById.mockResolvedValue({ _id: 'prob1' });
    getLanguageById.mockReturnValue(102);
    submitBatch.mockResolvedValue([{ token: 'tok1' }]);
    submitToken.mockResolvedValue([{ status_id: 3 }]);
    Problem.findByIdAndUpdate.mockResolvedValue({ _id: 'prob1', title: 'Two Sum Updated' });

    const req = { params: { id: 'prob1' }, body: SAMPLE_PROBLEM };
    const res = mockRes();
    await updateProblem(req, res);

    expect(Problem.findByIdAndUpdate).toHaveBeenCalledWith(
      'prob1',
      expect.any(Object),
      { runValidators: true, new: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should return 400 if updated reference solution fails test cases', async () => {
    Problem.findById.mockResolvedValue({ _id: 'prob1' });
    getLanguageById.mockReturnValue(102);
    submitBatch.mockResolvedValue([{ token: 'tok1' }]);
    submitToken.mockResolvedValue([{ status_id: 4 }]); // Wrong Answer

    const req = { params: { id: 'prob1' }, body: SAMPLE_PROBLEM };
    const res = mockRes();
    await updateProblem(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

// ─── DELETE PROBLEM ─────────────────────────────────────────
describe('deleteProblem()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return 404 if problem does not exist', async () => {
    Problem.findByIdAndDelete.mockResolvedValue(null);
    const req = { params: { id: 'ghost_id' } };
    const res = mockRes();
    await deleteProblem(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('Problem is Missing');
  });

  it('should delete problem and return 200', async () => {
    Problem.findByIdAndDelete.mockResolvedValue({ _id: 'prob1' });
    const req = { params: { id: 'prob1' } };
    const res = mockRes();
    await deleteProblem(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('Successfully Deleted');
  });

  it('should return 500 if deletion throws', async () => {
    Problem.findByIdAndDelete.mockRejectedValue(new Error('DB crash'));
    const req = { params: { id: 'prob1' } };
    const res = mockRes();
    await deleteProblem(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── GET PROBLEM BY ID ──────────────────────────────────────
describe('getProblemById()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return 404 if problem not found', async () => {
    const selectMock = jest.fn().mockResolvedValue(null);
    Problem.findById.mockReturnValue({ select: selectMock });
    const req = { params: { id: 'invalid_id' } };
    const res = mockRes();
    await getProblemById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('should return problem with video metadata if video exists', async () => {
    const mockProblemDoc = {
      _id: 'prob1',
      title: 'Two Sum',
      toObject: () => ({ _id: 'prob1', title: 'Two Sum' }),
    };
    const selectMock = jest.fn().mockResolvedValue(mockProblemDoc);
    Problem.findById.mockReturnValue({ select: selectMock });
    SolutionVideo.findOne.mockResolvedValue({
      secureUrl: 'https://cloudinary.com/video.mp4',
      thumbnailUrl: 'https://cloudinary.com/thumb.jpg',
      duration: 300,
    });

    const req = { params: { id: 'prob1' } };
    const res = mockRes();
    await getProblemById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ secureUrl: 'https://cloudinary.com/video.mp4' })
    );
  });

  it('should return problem without video if no video exists', async () => {
    const mockProblemDoc = { _id: 'prob1', title: 'Two Sum' };
    const selectMock = jest.fn().mockResolvedValue(mockProblemDoc);
    Problem.findById.mockReturnValue({ select: selectMock });
    SolutionVideo.findOne.mockResolvedValue(null);

    const req = { params: { id: 'prob1' } };
    const res = mockRes();
    await getProblemById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(mockProblemDoc);
  });
});

// ─── GET ALL PROBLEMS ────────────────────────────────────────
describe('getAllProblem()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return empty array when no problems exist', async () => {
    const selectMock = jest.fn().mockResolvedValue([]);
    Problem.find.mockReturnValue({ select: selectMock });

    const req = {};
    const res = mockRes();
    await getAllProblem(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith([]);
  });

  it('should return list of problems', async () => {
    const problems = [
      { _id: 'p1', title: 'Two Sum', difficulty: 'Easy', tags: 'Array' },
      { _id: 'p2', title: 'Best Time to Buy', difficulty: 'Medium', tags: 'DP' },
    ];
    const selectMock = jest.fn().mockResolvedValue(problems);
    Problem.find.mockReturnValue({ select: selectMock });

    const req = {};
    const res = mockRes();
    await getAllProblem(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(problems);
  });

  it('should return 500 if DB throws', async () => {
    Problem.find.mockImplementation(() => {
      throw new Error('DB Error');
    });
    const req = {};
    const res = mockRes();
    await getAllProblem(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── SOLVED ALL PROBLEMS BY USER ────────────────────────────
describe('solvedAllProblembyUser()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return list of solved problems for the user', async () => {
    const solvedList = [{ _id: 'p1', title: 'Two Sum', difficulty: 'Easy', tags: 'Array' }];
    const populateMock = jest.fn().mockResolvedValue({ problemSolved: solvedList });
    User.findById.mockReturnValue({ populate: populateMock });

    const req = { result: { _id: 'uid1' } };
    const res = mockRes();
    await solvedAllProblembyUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(solvedList);
  });

  it('should return 500 if DB throws', async () => {
    User.findById.mockImplementation(() => {
      throw new Error('DB crash');
    });
    const req = { result: { _id: 'uid1' } };
    const res = mockRes();
    await solvedAllProblembyUser(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── SUBMITTED PROBLEM HISTORY ───────────────────────────────
describe('submittedProblem()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return submissions for user and problem', async () => {
    const submissions = [
      { _id: 'sub1', status: 'accepted', runtime: 0.12, memory: 512 },
    ];
    Submission.find.mockResolvedValue(submissions);

    const req = { result: { _id: 'uid1' }, params: { pid: 'prob1' } };
    const res = mockRes();
    await submittedProblem(req, res);

    expect(Submission.find).toHaveBeenCalledWith({ userId: 'uid1', problemId: 'prob1' });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should return 200 with "No Submission" message if none exist', async () => {
    Submission.find.mockResolvedValue([]);
    const req = { result: { _id: 'uid1' }, params: { pid: 'prob1' } };
    const res = mockRes();
    await submittedProblem(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('No Submission is persent');
  });
});
