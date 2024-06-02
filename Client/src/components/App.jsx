import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Axios from 'axios'

const App = () => {
  const [auth, setAuth] = useState(false);
  const [message, setMessage] = useState("");
  const [count, setCount] = useState("");
  const [username, setUsername] = useState("");
  const [randomFilename, setRandomFilename] = useState("");

  useEffect(() => {
    const option = {
      method: 'get',
      url: "http://localhost:4500/verifyUser",
      headers: {
        Authorization: localStorage.getItem("token")
      }
    };
    Axios(option)
      .then(res => {
        if (res.data.status === "success") {
          setAuth(true)
          setUsername(res.data.email)
          setCount(res.data.count);
        } else {
          setAuth(false)
          setMessage(res.data.error)
        }
      })
      .catch(err => console.log(err));
  }, [])

  const handleDownloadRandomFile = async () => {
    try {
      const option = {
        headers: {
          Authorization: localStorage.getItem("token")
        }
      };
      await Axios.get("http://localhost:4500/getRandomFile", option).then((res) => {
        const { filename, count } = res.data;
        setRandomFilename(filename);
        setCount(count);
        const fileUrl = `http://localhost:4500/uploads/${filename}`;
        window.open(fileUrl, '_blank');
        // const aTag = document.createElement("a");
        // aTag.href = fileUrl;
        // aTag.setAttribute("download", filename);
        // document.body.appendChild(aTag);
        // aTag.click();
        // aTag.remove();
      })
    } catch (err) {
      console.error(err);
      setRandomFilename("");
    }
  };

  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  }

  const navigateTo = (value) => {
    navigate(value);
  }

  return (
    <div>
      {auth ? (
        <div className='download-section'>
          <div>
            <h1>Download Random File</h1>
            <button onClick={handleDownloadRandomFile}>Download</button>
            {randomFilename && (
              <p>Random Filename: {randomFilename}</p>
            )}
          </div>
          <div>
            <h4 >Total downloaded files: {count}</h4>
            <h2>{username}</h2>
            <button onClick={() => { logout() }}>Logout</button>
            <button onClick={() => { navigateTo("/upload") }}>Upload</button>
          </div>
        </div>
      ) : (
        <div className="auth-heading">
          <h1>{message}</h1>
          <button onClick={() => { navigateTo("/") }}>Login</button>
        </div>
      )}

    </div>
  );
};

export default App;