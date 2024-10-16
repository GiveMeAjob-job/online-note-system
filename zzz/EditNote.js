import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Box, 
  CircularProgress, 
  Snackbar, 
  Alert
} from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import debounce from 'lodash/debounce';
import { createNote, updateNote, getNote, getCategories, getTags } from '../services/api';
import NoteHistory from './NoteHistory';

const EditNote = () => {
  const [note, setNote] = useState({ title: '', content: '', category: '', tags: [] });
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [autoSaveMessage, setAutoSaveMessage] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const { noteId } = useParams();
  const { user } = useUser();

  const isEditMode = !!noteId;

  const stripHtml = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setError('用户未认证');
        setLoading(false);
        return;
      }
      try {
        const [categoriesData, tagsData] = await Promise.all([
          getCategories(),
          getTags()
        ]);
        setCategories(categoriesData);
        setTags(tagsData);

        if (isEditMode) {
          const fetchedNote = await getNote(user.id, noteId);
          setNote({
            ...fetchedNote,
            content: stripHtml(fetchedNote.content)
          });
          setWordCount(stripHtml(fetchedNote.content).trim().split(/\s+/).length);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('加载数据失败，请重试。');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, noteId, isEditMode]);

  const saveNote = useCallback(async (noteToSave, isDraft = true) => {
    if (!user?.id) {
      setError('用户未认证');
      return;
    }
    try {
      if (isEditMode) {
        await updateNote(user.id, noteId, noteToSave);
      } else {
        await createNote(noteToSave);
      }
      setAutoSaveMessage(isDraft ? '自动保存成功' : '保存成功');
      if (!isDraft) {
        setSuccess(true);
        setTimeout(() => navigate('/notes'), 2000);
      }
    } catch (error) {
      console.error('保存失败:', error);
      setError('保存失败，请重试。');
    }
  }, [user, navigate, noteId, isEditMode]);

  const debouncedSave = useCallback(
    debounce((noteToSave) => saveNote(noteToSave, true), 2000),
    [saveNote]
  );

  useEffect(() => {
    if (note.title || note.content) {
      debouncedSave(note);
    }
  }, [note, debouncedSave]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveNote(note, false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNote(prevNote => ({ ...prevNote, [name]: value }));
  };

  const handleContentChange = (content) => {
    setNote(prevNote => ({ ...prevNote, content }));
    setWordCount(stripHtml(content).trim().split(/\s+/).length);
  };

  const handleVersionRestore = (restoredContent) => {
    setNote(prevNote => ({ ...prevNote, content: restoredContent }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm">
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEditMode ? '编辑笔记' : '新建笔记'}
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
          <Box mt={2}>
            <Button type="submit" variant="contained" color="primary">
              {isEditMode ? '更新笔记' : '创建笔记'}
            </Button>
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={() => navigate('/notes')} 
              sx={{ ml: 2 }}
            >
              取消
            </Button>
          </Box>
        </Box>
        <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
          {autoSaveMessage}
        </Typography>
        {isEditMode && <NoteHistory noteId={noteId} onVersionRestore={handleVersionRestore} />}
      </Paper>
      <Snackbar open={success} autoHideDuration={2000}>
        <Alert severity="success" sx={{ width: '100%' }}>
          笔记{isEditMode ? '更新' : '创建'}成功！
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EditNote;
