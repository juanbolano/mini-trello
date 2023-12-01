import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Card from "./Card";
import "./scroll.css";
import { Droppable } from "react-beautiful-dnd";
import { useQuery, useMutation, gql } from "@apollo/client";
import Modal from "react-modal";

const Container = styled.div`
  background-color: #f4f5f7;
  border-radius: 2.5px;
  width: 800px;
  height: 875px;
  overflow-y: scroll;
  -ms-overflow-style: none;
  scrollbar-width: none;
  border: 1px solid gray;
`;

const Title = styled.h3`
  padding: 8px;
  background-color: pink;
  text-align: center;
  position: relative;
`;

const CardList = styled.div`
  padding: 3px;
  transistion: background-color 0.2s ease;
  background-color: #f4f5f7;
  flex-grow: 1;
  min-height: 100px;
`;

const AddButton = styled.button`
position: absolute;
top: 50%;
right: 8px;
transform: translateY(-50%);
background-color: #56ccf2;
color: #fff;
border: none;
padding: 8px 16px;
cursor: pointer;
border-radius: 4px;

  &:hover {
    background-color: #2c98f0;
  }
`;

const modalStyles = {
  content: {
    width: "800px",
    height: "fit-content",
    margin: "auto",
    borderRadius: "8px",
    padding: "20px",
  },
};

export default function Column({ title, id }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardContent, setNewCardContent] = useState("");
  const GET_CARDS = gql`
    query {
      cards (column: "${id}") {
        id
        title
        content
      }
    }
  `;
  const { loading, error, data, refetch } = useQuery(GET_CARDS);

  useEffect(() => {
    refetch();
  }, [data, refetch]);

  const [
    addCardMutation,
    { loading: loadingRemoveMutation, error: deleteError },
  ] = useMutation(
    gql`
      mutation AddCard($title: String!, $content: String!, $column: String!) {
        addCard(title: $title, content: $content, column: $column) {
          card {
            id
            title
            content
            column
            created
          }
        }
      }
    `
  );

  function openAddModal() {
    setIsAddModalOpen(true);
  }

  function closeAddModal() {
    setIsAddModalOpen(false);
  }

  function handleAddCard(title, content) {
    addCardMutation({
      variables: { title, content, column: id },
    });
    closeAddModal();
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;
  const cards = data.cards;
  return (
    (
      <Container className="column">
        <Title>
          {title}
          <AddButton onClick={openAddModal}>Add card</AddButton>
        </Title>
        <Droppable droppableId={id}>
          {(provided, snapshot) => (
            <CardList
              ref={provided.innerRef}
              {...provided.droppableProps}
              isDraggingOver={snapshot.isDraggingOver}
            >
              {cards &&
                cards.map((card, index) => (
                  <Card key={index} index={index} card={card} />
                ))}
            </CardList>
          )}
        </Droppable>
        <Modal
          isOpen={isAddModalOpen}
          onRequestClose={closeAddModal}
          style={modalStyles}
        >
          <h4 style={{marginBottom: "16px" }}>Add new card</h4>
          <label style={{ marginBottom: "8px" }}>
            Title:
            <input
              type="text"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              style={{ width: "100%", padding: "8px", boxSizing: "border-box", marginBottom: "8px" }}
            />
          </label>
          <label style={{ marginBottom: "16px" }}>
            Content:
            <input
              type="text"
              value={newCardContent}
              onChange={(e) => setNewCardContent(e.target.value)}
              style={{ width: "100%", padding: "8px", boxSizing: "border-box", marginBottom: "8px" }}
            />
          </label>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={() => handleAddCard(newCardTitle, newCardContent)}
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
              onClick={closeAddModal}
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
      </Container>
    )
  );
}