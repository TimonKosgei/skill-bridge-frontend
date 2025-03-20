import React, { useState, useEffect } from 'react';

import Header from '../components/Header';

const Profile = ({ user }) => {
  const [data,setData] = useState([]);
  const [loading, setLoadng] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/users/1')
    .then(response =>{
      if (!response.ok) {
        throw new Error(`Http error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => setData(data))
    .catch(error => setError(error))
    .finally(() => setLoadng(false));
  }
  ,[]);

//error handling

console.log(loading)
console.log(error)
  return (
    <>
      <Header />
      <div className="container mx-auto p-8">
        <div className="bg-white p-6 rounded shadow-md">
          <div className="flex flex-col lg:flex-row items-center">
            <img src={data.profile_picture_url} alt={data.username} className="w-32 h-32 rounded-full mb-4 lg:mb-0 lg:mr-4" />
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-4">{data.username}</h1>
              <p className="text-gray-700 mb-2"><strong>Email:</strong> {data.email}</p>
              <p className="text-gray-700 mb-2"><strong>First Name:</strong> {data.first_name}</p>
              <p className="text-gray-700 mb-2"><strong>Last Name:</strong> {data.last_name}</p>
              <p className="text-gray-700 mb-2"><strong>Role:</strong> {data.role}</p>
              <p className="text-gray-700"><strong>Bio:</strong> {data.bio}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
