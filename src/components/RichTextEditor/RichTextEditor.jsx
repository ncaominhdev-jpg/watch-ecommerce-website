import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

const RichTextEditor = ({ value, onChange }) => {
  return (
    <Editor
      apiKey="kopg29qtp7buegn0gvha0kw5x0640kup25llnek9z19c4r4u"
      value={value}
      onEditorChange={onChange}
      init={{
        height: 400,
        menubar: false,
        plugins:
          'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
        toolbar:
          'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
      }}
    />
  );
};

export default RichTextEditor;
