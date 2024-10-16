import React, { useState, useEffect, useCallback } from 'react';
import { createOrUpdateNote, getNote, getCategories, getTags } from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { TextField, Button, Paper, Typography, Box, Autocomplete, Chip } from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import debounce from 'lodash/debounce';
import NoteHistory from './NoteHistory';
import { useUser } from '../contexts/UserContext'; // 假设您有一个用户上下文

const NoteForm = () => {
  const [note, setNote] = useState({ title: '', content: '', category: '', tags: [] });
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [autoSaveMessage, setAutoSaveMessage] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser(); // 获取当前用户信息

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const noteData = await getNote(id);
        setNote(noteData);
      }
      const categoriesData = await getCategories();
      const tagsData = await getTags();
      setCategories(categoriesData);
      setTags(tagsData);
    };
    fetchData();
  }, [id]);

  const saveNote = useCallback(async (noteToSave, noteId, isDraft = true) => {
    try {
      if (!user || !user.id) {
        throw new Error('User not authenticated');
      }
      await createOrUpdateNote({ ...noteToSave, user: user.id, _id: noteId }, isDraft);
      setAutoSaveMessage(isDraft ? '自动保存成功' : '保存成功');
    } catch (error) {
      console.error('保存失败:', error);
      setAutoSaveMessage('保存失败');
    }
  }, [user]);

  const debouncedSave = useCallback(
    debounce((noteToSave, noteId) => saveNote(noteToSave, noteId, true), 2000),
    [saveNote]
  );

  useEffect(() => {
    if (note.title || note.content) {
      debouncedSave(note, id);
    }
  }, [note, id, debouncedSave]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveNote(note, id, false);
    navigate('/notes');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNote(prevNote => ({ ...prevNote, [name]: value }));
  };

  const handleContentChange = (content) => {
    setNote(prevNote => ({ ...prevNote, content }));
    setWordCount(content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length);
  };

  const handleVersionRestore = (restoredContent) => {
    setNote(prevNote => ({ ...prevNote, content: restoredContent }));
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {id ? '编辑笔记' : '新建笔记'}
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="标题"
          name="title"
          value={note.title}
          onChange={handleChange}
          margin="normal"
          required
        />
        <ReactQuill
          value={note.content}
          onChange={handleContentChange}
          style={{ height: '200px', marginBottom: '50px' }}
        />
        <Typography variant="body2" color="textSecondary" align="right">
          字数：{wordCount}
        </Typography>
        <Autocomplete
          freeSolo
          options={categories}
          value={note.category}
          onChange={(event, newValue) => {
            setNote(prevNote => ({ ...prevNote, category: newValue }));
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="分类"
              name="category"
              margin="normal"
            />
          )}
        />
        <Autocomplete
          multiple
          freeSolo
          options={tags}
          value={note.tags}
          onChange={(event, newValue) => {
            setNote(prevNote => ({ ...prevNote, tags: newValue }));
          }}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip variant="outlined" label={option} {...getTagProps({ index })} />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="标签"
              name="tags"
              margin="normal"
            />
          )}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 3, mb: 2 }}
        >
          {id ? '更新笔记' : '创建笔记'}
        </Button>
      </Box>
      <Typography variant="body2" color="textSecondary" align="center">
        {autoSaveMessage}
      </Typography>
      {id && <NoteHistory noteId={id} onVersionRestore={handleVersionRestore} />}
    </Paper>
  );
};

export default NoteForm;
