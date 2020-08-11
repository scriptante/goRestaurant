import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      const response = await api.get('/foods');
      setFoods(response.data);
    }
    loadFoods();
  }, []);

  async function handleAddFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const schema = Yup.object().shape({
        image: Yup.string().required('imagem obrigatório'),
        name: Yup.string().required('Nome obrigatório'),
        price: Yup.string().required('imagem obrigatório'),
        description: Yup.string(),
      });
      await schema.validate(food, {
        abortEarly: false,
      });
      const response = await api.post('/foods', { ...food, available: true });
      setFoods([...foods, response.data]);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    const schema = Yup.object().shape({
      image: Yup.string().required('imagem obrigatório'),
      name: Yup.string().required('Nome obrigatório'),
      price: Yup.string().required('imagem obrigatório'),
      description: Yup.string(),
    });
    await schema.validate(food, {
      abortEarly: false,
    });
    const updatedFood = await api.put(`/foods/${editingFood.id}`, {
      ...food,
      available: editingFood.available,
    });
    const foodList = foods.map(f =>
      f.id === editingFood.id ? updatedFood.data : f,
    );
    setFoods(foodList);
  }

  async function handleDeleteFood(id: number): Promise<void> {
    await api.delete(`/foods/${id}`);
    setFoods(foods.filter(food => food.id !== id));
  }

  function toggleModal(): void {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal(): void {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: IFoodPlate): void {
    setEditingFood(food);
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
              setIsOpen={toggleEditModal}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
