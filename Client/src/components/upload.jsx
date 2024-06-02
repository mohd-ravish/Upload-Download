import React, { useState } from "react"
import Axios from 'axios'

function App() {
  const [file, setFile] = useState()

  const upload = async () => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (formData.length > 0) {
        await Axios.post('http://localhost:4500/upload', formData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1>File Uploads</h1>
      <form>
        <label for="image">File Upload</label>
        <input type="file" id="image" name="file" onChange={(e) => setFile(e.target.files[0])} required />
        <input type="submit" name="submit" onClick={upload} />
      </form>
    </div>
  )
}

export default App;