import { useParams, NavLink, useNavigate } from 'react-router';
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import axiosClient from '../utils/axiosClient';

function AdminUpload() {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset, setError, clearErrors } = useForm();
  const selectedFile = watch('videoFile')?.[0];

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      // Create a FileList-compatible object
      const dt = new DataTransfer();
      dt.items.add(file);
      setValue('videoFile', dt.files);
    }
  }, [setValue]);

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const onSubmit = async (data) => {
    const file = data.videoFile[0];
    setUploading(true);
    setUploadProgress(0);
    clearErrors();
    try {
      const signatureResponse = await axiosClient.get(`/video/create/${problemId}`);
      const { signature, timestamp, public_id, api_key, cloud_name, upload_url } = signatureResponse.data;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp);
      formData.append('public_id', public_id);
      formData.append('api_key', api_key);

      const uploadResponse = await axios.post(upload_url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          setUploadProgress(Math.round((e.loaded * 100) / e.total));
        },
      });

      const cloudinaryResult = uploadResponse.data;
      const metadataResponse = await axiosClient.post('/video/save', {
        problemId,
        cloudinaryPublicId: cloudinaryResult.public_id,
        secureUrl: cloudinaryResult.secure_url,
        duration: cloudinaryResult.duration,
      });

      setUploadedVideo(metadataResponse.data.videoSolution);
      reset();
    } catch (err) {
      setError('root', { type: 'manual', message: err.response?.data?.message || 'Upload failed. Please try again.' });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-base-100/90 backdrop-blur-md border-b border-base-300">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center gap-3">
          <NavLink to="/admin" className="flex items-center gap-1.5 text-sm opacity-60 hover:opacity-100 transition-opacity">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Admin
          </NavLink>
          <span className="opacity-20">/</span>
          <span className="text-sm font-bold" style={{ color: '#6366f1' }}>Upload Video</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8 animate-slideUp">
          <h1 className="text-3xl font-extrabold mb-1">
            Upload <span style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Video Editorial</span>
          </h1>
          <p className="text-sm opacity-40">
            Problem ID: <code className="px-1.5 py-0.5 rounded bg-base-300 text-xs">{problemId}</code>
            {' — '}Upload a video solution (max 100 MB).
          </p>
        </div>

        {/* Success state */}
        {uploadedVideo ? (
          <div className="rounded-2xl border bg-base-100 p-8 text-center animate-slideUp" style={{ borderColor: 'rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.05)' }}>
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold mb-1 text-green-400">Upload Successful!</h2>
            <p className="text-sm opacity-60 mb-6">
              Duration: {formatDuration(uploadedVideo.duration)} · Uploaded {new Date(uploadedVideo.uploadedAt).toLocaleString()}
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setUploadedVideo(null); reset(); }}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-base-300 hover:bg-base-300 transition-colors">
                Upload Another
              </button>
              <NavLink to="/admin"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                Back to Admin →
              </NavLink>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className="rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer"
              style={{
                borderColor: dragOver ? '#6366f1' : selectedFile ? 'rgba(34,197,94,0.5)' : 'rgba(99,102,241,0.3)',
                background: dragOver ? 'rgba(99,102,241,0.06)' : selectedFile ? 'rgba(34,197,94,0.04)' : 'transparent',
              }}>
              <label className="flex flex-col items-center justify-center gap-4 py-14 cursor-pointer">
                {selectedFile ? (
                  <>
                    <div className="text-4xl">🎬</div>
                    <div className="text-center">
                      <p className="font-semibold text-green-400">{selectedFile.name}</p>
                      <p className="text-sm opacity-50 mt-0.5">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    <span className="text-xs opacity-40">Click to change file</span>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                      style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.1))', border: '1px solid rgba(99,102,241,0.2)' }}>
                      📹
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-sm">Drop your video here</p>
                      <p className="text-xs opacity-40 mt-1">or click to browse · MP4, MOV, WebM up to 100 MB</p>
                    </div>
                  </>
                )}
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  {...register('videoFile', {
                    required: 'Please select a video file',
                    validate: {
                      isVideo: (files) => !files?.[0] || files[0].type.startsWith('video/') || 'Please select a valid video file',
                      fileSize: (files) => !files?.[0] || files[0].size <= 100 * 1024 * 1024 || 'File size must be less than 100 MB',
                    },
                  })}
                  disabled={uploading}
                />
              </label>
            </div>

            {errors.videoFile && (
              <p className="text-sm text-red-400 px-1">{errors.videoFile.message}</p>
            )}

            {/* Upload progress */}
            {uploading && (
              <div className="rounded-2xl border border-base-300 bg-base-100 p-6 animate-slideUp">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold">Uploading to Cloudinary...</span>
                  <span className="text-sm font-bold" style={{ color: '#6366f1' }}>{uploadProgress}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-base-300 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%`, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }} />
                </div>
                <p className="text-xs opacity-40 mt-2">Please don't close this tab while uploading.</p>
              </div>
            )}

            {/* Error */}
            {errors.root && (
              <div className="rounded-xl px-5 py-3 text-sm font-medium"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                {errors.root.message}
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-4">
              <NavLink to="/admin"
                className="flex-1 py-3 rounded-2xl text-sm font-semibold text-center border border-base-300 hover:bg-base-300 transition-colors">
                Cancel
              </NavLink>
              <button type="submit" disabled={uploading || !selectedFile}
                className="flex-1 py-3 rounded-2xl text-sm font-bold text-white disabled:opacity-40 transition-opacity flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                {uploading ? (
                  <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Uploading...</>
                ) : '⬆ Upload Video'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AdminUpload;