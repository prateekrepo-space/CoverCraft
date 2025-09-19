import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import './App.css';

const formSteps = [
  { id: 1, name: "Upload" },
  { id: 2, name: "Job Details" },
  { id: 3, name: "Customize" },
];

const letterTemplates = [
  { id: 'standard', name: 'Standard' },
  { id: 'corporate', name: 'Corporate' },
  { id: 'elegant', name: 'Elegant' },
  { id: 'modern-minimal', name: 'Modern Minimal' },
  { id: 'business-formal', name: 'Business Formal' },
  { id: 'creative', name: 'Creative' },
  { id: 'tech', name: 'Tech' },
  { id: 'minimalist', name: 'Minimalist' },
  { id: 'academic', name: 'Academic' },
  { id: 'executive', name: 'Executive' },
  { id: 'professional-accent', name: 'Pro Accent' },
  { id: 'vintage', name: 'Vintage' },
];

function EditableField({ value, onChange, as = 'input', ...props }) {
  const Component = as;
  return (
    <Component
      value={value || ''}
      onChange={onChange}
      className={as === 'textarea' ? 'editable-textarea' : 'editable-field'}
      {...props}
    />
  );
}

function LetterPreview({ letterData, isEditing, onFieldChange, className, selectedTemplate }) {
  if (!letterData) return null;

  const {
    senderName, senderAddress, senderContact, date,
    recipientName, recipientTitle, companyName, companyAddress,
    salutation, body, closing, signature,
    senderJobTitle
  } = letterData;

  const createHandler = (field) => (e) => onFieldChange(field, e.target.value);

  return (
    <div className={`letter-preview ${className}`}>
      {selectedTemplate === 'corporate' && (
        <div className="corporate-header">
          <div className="left-title">
            {isEditing ? <EditableField value={senderName} onChange={createHandler('senderName')} as="input" style={{color: 'white', border: '1px dashed rgba(255,255,255,0.5)'}} /> : <h2>{senderName}</h2>}
            {isEditing ? <EditableField value={senderJobTitle} onChange={createHandler('senderJobTitle')} as="input" style={{color: 'white', fontSize: '1rem', border: '1px dashed rgba(255,255,255,0.5)'}} /> : <p>{senderJobTitle}</p>}
          </div>
          <div className="right-contact">
            {isEditing ? <EditableField value={senderContact} onChange={createHandler('senderContact')} as="textarea" rows="3" style={{color: 'white', border: '1px dashed rgba(255,255,255,0.5)'}} /> : <p>{senderContact}</p>}
          </div>
        </div>
      )}
      {selectedTemplate === 'elegant' && (
        <div className="sender-header-elegant">
          {isEditing ? <EditableField value={senderName} onChange={createHandler('senderName')} as="input" /> : <h2>{senderName}</h2>}
          {isEditing ? <EditableField value={senderJobTitle} onChange={createHandler('senderJobTitle')} as="input" className="job-title" /> : <p className="job-title">{senderJobTitle}</p>}
          <div className="contact-info">
            {isEditing ? <EditableField value={senderContact} onChange={createHandler('senderContact')} as="input" /> : <p>{senderContact}</p>}
          </div>
          <hr/>
        </div>
      )}
      {selectedTemplate === 'creative' && (
        <div className="creative-top-banner">
          {isEditing ? <EditableField value={senderName} onChange={createHandler('senderName')} as="input" style={{fontSize: '2rem', textAlign: 'center'}}/> : <h2>{senderName}</h2>}
          {isEditing ? <EditableField value={senderJobTitle} onChange={createHandler('senderJobTitle')} as="input" style={{fontSize: '1rem', textAlign: 'center'}}/> : <p>{senderJobTitle}</p>}
        </div>
      )}
      <div className="letter-header">
        {selectedTemplate !== 'corporate' && selectedTemplate !== 'elegant' && selectedTemplate !== 'creative' && (
          <div className="sender-info">
            {isEditing ? (
              <>
                <EditableField as="input" value={senderName} onChange={createHandler('senderName')} style={{fontSize: '1.5rem', fontWeight: 'bold'}} />
                <EditableField as="input" value={senderAddress} onChange={createHandler('senderAddress')} />
                <EditableField as="input" value={senderContact} onChange={createHandler('senderContact')} />
              </>
            ) : (
              <>
                <h2>{senderName}</h2>
                <p>{senderAddress}</p>
                <p>{senderContact}</p>
              </>
            )}
          </div>
        )}
        {isEditing ? <EditableField value={date} onChange={createHandler('date')} /> : <p>{date}</p>}
        <div className="recipient-info">
          {isEditing ? (
            <>
              <EditableField value={recipientName} onChange={createHandler('recipientName')} />
              <EditableField value={recipientTitle} onChange={createHandler('recipientTitle')} />
              <EditableField value={companyName} onChange={createHandler('companyName')} />
              <EditableField value={companyAddress} onChange={createHandler('companyAddress')} />
            </>
          ) : (
            <>
              <p>{recipientName}</p>
              <p>{recipientTitle}</p>
              <p>{companyName}</p>
              <p>{companyAddress}</p>
            </>
          )}
        </div>
      </div>
      <div className="letter-salutation">
        {isEditing ? <EditableField value={salutation} onChange={createHandler('salutation')} /> : <p>{salutation}</p>}
      </div>
      <div className="letter-body">
        {isEditing ? (
          <EditableField as="textarea" value={body} onChange={createHandler('body')} />
        ) : (
          body.split('\n\n').map((paragraph, index) => <p key={index}>{paragraph}</p>)
        )}
      </div>
      <div className="letter-closing">
        {isEditing ? (
          <>
            <EditableField value={closing} onChange={createHandler('closing')} />
            <EditableField value={signature} onChange={createHandler('signature')} />
          </>
        ) : (
          <>
            <p>{closing}</p>
            <p>{signature}</p>
          </>
        )}
      </div>
    </div>
  );
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + ['Bytes', 'KB', 'MB'][i];
};

function ModernUploader({ file, progress, isUploading, onFileSelect, onFileRemove, setUploadError }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
    e.target.value = null;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };
  
  const handleRemoveClick = (e) => {
    e.stopPropagation();
    onFileRemove();
  };

  return (
    <div
      className="modern-uploader"
      onClick={() => !file && fileInputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        disabled={!!file}
      />
      <AnimatePresence>
        {!file ? (
          <motion.div
            key="uploader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="uploader-content"
          >
            <svg className="uploader-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p>
                <span className="uploader-text-main">Drag & drop files here</span>
                , or click to browse
            </p>
            <p className="uploader-text-secondary">
                Supports: 1 PDF (Max 10MB)
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="file-preview-container-integrated"
          >
            {!isUploading && (
              <button onClick={handleRemoveClick} className="remove-file-button">
                &times;
              </button>
            )}
            <div className="file-info">
              <span className="file-info-icon">📄</span>
              <div className="file-info-text">
                <p className="name">{file.name}</p>
                <p className="size">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <div className="progress-bar-container">
              <motion.div
                className="progress-bar"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>
            <p className="upload-status">
              {isUploading ? 'Uploading...' : 'Upload Complete!'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TemplateChooser({ selectedTemplate, onSelectTemplate }) {
    return (
      <div className="template-chooser">
        {letterTemplates.map(template => (
          <button 
            key={template.id} 
            className={`template-btn ${selectedTemplate === template.id ? 'active' : ''}`}
            onClick={() => onSelectTemplate(template.id)}
          >
            {template.name}
          </button>
        ))}
      </div>
    );
  }

function GeneratorPage() {
  const [step, setStep] = useState(1);
  const [resumeFile, setResumeFile] = useState(null); 
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState('Professional');
  const [userSkills, setUserSkills] = useState('');
  const [companyInfo, setCompanyInfo] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editableLetter, setEditableLetter] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('standard');
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (generatedLetter) {
      setEditableLetter(generatedLetter);
    }
  }, [generatedLetter]);

  const handleFileSelect = (selectedFile) => {
    setError('');
    
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File is too large. Max size is 10MB.');
      return;
    }
    
    if (selectedFile.type !== 'application/pdf') {
      setError('Invalid file type. Please upload a PDF.');
      return;
    }

    setResumeFile(selectedFile);
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setTimeout(() => setStep(2), 800);
          return 100;
        }
        return prev + 10;
      });
    }, 50);
  };
  
  const handleFileRemove = () => {
    setResumeFile(null);
    setUploadProgress(0);
  };

  const handleGenerateClick = async () => {
    if (!resumeFile) return setError('Please upload your resume.');
    if (!jobDescription) return setError('Please provide the job description.');
    setIsLoading(true);
    setError('');
    setGeneratedLetter(null);
    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('jobDescription', jobDescription);
    formData.append('tone', tone);
    formData.append('userSkills', userSkills);
    formData.append('companyInfo', companyInfo);
    try {
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/generate-letter`;
        const response = await axios.post(apiUrl, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        setGeneratedLetter(response.data);
        setEditableLetter(response.data);
        toast.success('Cover Letter Generated! Scroll down to see it.');
    } catch (err) {
        setError('An error occurred. Is the backend server running?');
    } finally {
        setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!editableLetter) return;
    const doc = new jsPDF();
    const {
      senderName, senderAddress, senderContact, date,
      recipientName, recipientTitle, companyName, companyAddress,
      salutation, body, closing, signature
    } = editableLetter;
    
    const margin = 15;
    let y = 20;

    doc.setFontSize(18);
    doc.setFont('times', 'bold');
    doc.text(senderName || '', doc.internal.pageSize.getWidth() - margin, y, { align: 'right' });
    y += 7;

    doc.setFontSize(10);
    doc.setFont('times', 'normal');
    doc.text(senderAddress || '', doc.internal.pageSize.getWidth() - margin, y, { align: 'right' });
    y += 5;
    doc.text(senderContact || '', doc.internal.pageSize.getWidth() - margin, y, { align: 'right' });
    y += 15;

    doc.text(date || '', margin, y);
    y += 10;

    doc.setFont('times', 'bold');
    doc.text(recipientName || '', margin, y);
    y += 5;
    doc.setFont('times', 'normal');
    doc.text(recipientTitle || '', margin, y);
    y += 5;
    doc.text(companyName || '', margin, y);
    y += 5;
    doc.text(companyAddress || '', margin, y);
    y += 15;

    doc.setFont('times', 'bold');
    doc.text(salutation || '', margin, y);
    y += 10;

    doc.setFont('times', 'normal');
    const bodyLines = doc.splitTextToSize((body || '').replace(/\n\n/g, '\n \n'), doc.internal.pageSize.getWidth() - margin * 2);
    doc.text(bodyLines, margin, y);
    y += (bodyLines.length * 5) + 10;

    doc.text(closing || '', margin, y);
    y += 10;
    doc.text(signature || '', margin, y);

    doc.save(`${(senderName || 'cover_letter').replace(' ', '_')}_Cover_Letter.pdf`);
  };

  const handleFieldChange = (field, value) => {
    setEditableLetter(prev => ({...prev, [field]: value}));
  };

  const motionVariants = {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
  };

  return (
    <>
      <header className="header">
        <div className="header-content">
          <div className="logo-container">
            <svg className="logo-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <h1 className="logo-text">CoverCraft</h1>
          </div>
        </div>
      </header>
      <div className="container">
        <motion.div 
          className="card upload-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <nav className="form-steps-nav">
            {formSteps.map(s => (
              <button 
                key={s.id} 
                className={`step-button ${step === s.id ? 'active' : ''}`}
                onClick={() => setStep(s.id)}
              >
                {s.name}
                {step === s.id ? <motion.div className="underline" layoutId="underline" /> : null}
              </button>
            ))}
          </nav>
          <main className="form-content">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                variants={motionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                {step === 1 && (
                  <fieldset>
                    <legend>Upload Your Resume</legend>
                    <ModernUploader 
                      file={resumeFile}
                      progress={uploadProgress}
                      isUploading={isUploading}
                      onFileSelect={handleFileSelect}
                      onFileRemove={handleFileRemove}
                      setUploadError={setError} 
                    />
                  </fieldset>
                )}
                {step === 2 && (
                  <fieldset>
                    <legend>Enter the Job Details</legend>
                    <textarea className="form-textarea" placeholder="Paste the Job Description here..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows="12"/>
                  </fieldset>
                )}
                {step === 3 && (
                  <fieldset>
                    <legend>Customize & Generate</legend>
                    <select className="form-select" value={tone} onChange={(e) => setTone(e.target.value)}>
                      <option value="Professional">Professional</option>
                      <option value="Enthusiastic">Enthusiastic</option>
                      <option value="Formal">Formal</option>
                      <option value="Creative">Creative</option>
                    </select>
                    <input type="text" className="form-input" placeholder="Optional: Key skills to emphasize" value={userSkills} onChange={(e) => setUserSkills(e.target.value)}/>
                    <input type="text" className="form-input" placeholder="Optional: Specific company info" value={companyInfo} onChange={(e) => setCompanyInfo(e.target.value)}/>
                  </fieldset>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
          
          {step === 3 && (
            <div style={{padding: '0 2.5rem 2.5rem'}}>
              <button className="analyze-btn" onClick={handleGenerateClick} disabled={isLoading || !resumeFile || !jobDescription}>
                {isLoading ? (<><div className="spinner"></div><span>Crafting...</span></>) : 'Generate Cover Letter'}
              </button>
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {error && <motion.p className="error" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>{error}</motion.p>}
        </AnimatePresence>
        
        <AnimatePresence>
          {editableLetter && !isLoading && (
            <motion.div 
              className="card results-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="sub-section">
                <h3>
                  Your Generated Cover Letter
                  <div className="results-actions">
                    {isEditing ? (
                       <button onClick={() => setIsEditing(false)} className="action-btn save-btn">Save</button>
                    ) : (
                       <button onClick={() => setIsEditing(true)} className="action-btn edit-btn">Edit</button>
                    )}
                    <button onClick={handleDownloadPDF} className="action-btn download-btn">Download PDF</button>
                  </div>
                </h3>
                <TemplateChooser 
                  selectedTemplate={selectedTemplate} 
                  onSelectTemplate={setSelectedTemplate} 
                />
                <LetterPreview 
                  letterData={editableLetter}
                  isEditing={isEditing}
                  onFieldChange={handleFieldChange}
                  className={`template-${selectedTemplate}`}
                  selectedTemplate={selectedTemplate}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="generator-footer">
          Note: AI can make mistakes. Please review and edit the generated cover letter carefully before sending.
        </footer>
      </div>
    </>
  );
}

export default GeneratorPage;