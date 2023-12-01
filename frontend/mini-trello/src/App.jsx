import React, { useState } from 'react';
import './App.css';
import styled from "styled-components";
import Board from "./components/Board";
import { useQuery, useMutation, gql } from '@apollo/client';
import Modal from "react-modal";

const GET_BOARDS = gql`
  query {
    boards {
      id
      title
    }
  }
`;

const ADD_BOARD = gql`
  mutation AddBoard($title: String!) {
    addBoard(title: $title) {
      board {
        id
        title
      }
    }
  }
`;

const AddButton = styled.button`
background-color: #56ccf2;
color: #fff;
border: none;
padding: 8px 16px;
cursor: pointer;
margin-left: 20px;
border-radius: 4px;

  &:hover {
    background-color: #2c98f0;
  }
`;

function App() {
  const { loading, error, data } = useQuery(GET_BOARDS);
  const [isAddBoardModalOpen, setIsAddBoardModalOpen] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [addBoardMutation] = useMutation(ADD_BOARD, {
    refetchQueries: [{ query: GET_BOARDS }],
  });

  const openAddBoardModal = () => {
    setIsAddBoardModalOpen(true);
  };

  const closeAddBoardModal = () => {
    setIsAddBoardModalOpen(false);
  };

  const handleAddBoard = () => {
    addBoardMutation({
      variables: { title: newBoardTitle },
    });
    setNewBoardTitle("");
    closeAddBoardModal();
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  const boardExists = data.boards.length > 0;
  const id = boardExists ? data.boards[0].id : "";
  const title = boardExists ? data.boards[0].title : "";

  return (
    <div className="App">
      <header className="App-header">
        {boardExists ? (
          <Board title={title} id={id} />
        ) : (
          <>
            <p>There is no board</p>
            <AddButton onClick={openAddBoardModal}>Add Board</AddButton>
          </>
        )}
        <Modal
          isOpen={isAddBoardModalOpen}
          onRequestClose={closeAddBoardModal}
          style={{
            content: {
              width: "300px",
              height: "fit-content",
              margin: "auto",
              borderRadius: "8px",
              padding: "20px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              backgroundColor: "#fff",
            },
            overlay: {
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            },
          }}
        >
          <p style={{ fontSize: "18px", marginBottom: "16px" }}>Add new board</p>
          <label style={{ marginBottom: "16px", display: "block" }}>
            <span style={{ marginBottom: "4px", display: "block" }}>Title:</span>
            <input
              type="text"
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                boxSizing: "border-box",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
          </label>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={handleAddBoard}
              style={{
                backgroundColor: "#56ccf2",
                color: "#fff",
                border: "none",
                padding: "8px 16px",
                cursor: "pointer",
                borderRadius: "4px",
                marginRight: "8px",
              }}
            >
              Confirm
            </button>
            <button
              onClick={closeAddBoardModal}
              style={{
                backgroundColor: "#ccc",
                color: "#fff",
                border: "none",
                padding: "8px 16px",
                cursor: "pointer",
                borderRadius: "4px",
              }}
            >
              Cancel
            </button>
          </div>
        </Modal>
      </header>
    </div>
  );
}

export default App;

