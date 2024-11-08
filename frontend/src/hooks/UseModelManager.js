import { useState } from 'react';

const useModelManager = () => {
  const [models, setModels] = useState([]);

  const loadModels = async () => {
    const token = localStorage.getItem('authToken');
  
    const response = await fetch('http://localhost:5000/load-models', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
  
    const models = await response.json();
    console.log(models);
    setModels(models);
  };

  const saveModel = async (modelData) => {
    const token = localStorage.getItem('authToken');
  
    const response = await fetch('http://localhost:5000/save-model', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(modelData)
    });
  
    const result = await response.json();
    console.log(result);
  };

  return {
    models,
    loadModels,
    saveModel,
  };
};

export default useModelManager;
