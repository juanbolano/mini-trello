import React, { useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import styled from "styled-components";
import { useMutation, gql } from "@apollo/client";
import Modal from "react-modal";


const Container = styled.div`
  border-radius: 10px;
  box-shadow: 5px 5px 5px 2px grey;
  padding: 15px;
  color: #000;
  margin-bottom: 15px;
  min-height: 150px;
  margin-left: 20px;
  margin-right: 20px;
  background-color: ${(props) => bgcolorChange(props)};
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  position: relative;
`;

const CardTitle = styled.div``;
const CardContent = styled.div``;

const DeleteButton = styled.button`
  margin-top: 10px;
  background-color: #ff4f4f;
  color: #fff;
  border: none;
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    background-color: #d63434;
  }
`;

const EditButton = styled.button`
margin-top: 10px;
background-color: #ff4f4f;
color: #fff;
border: none;
padding: 8px 16px;
cursor: pointer;
border-radius: 4px;

&:hover {
  background-color: #d63434;
}
`;

const modalStyles = {
  content: {
    width: "300px",
    height: "fit-content",
    margin: "auto",
    borderRadius: "8px",
    padding: "20px",
  },
};

function bgcolorChange(props) {
  return props.isDragging
    ? "lightgreen"
    : props.isDraggable
    ? props.isBacklog
      ? "#F2D7D5"
      : "#DCDCDC"
    : props.isBacklog
    ? "#F2D7D5"
    : "#EAF4FC";
}

export default function Card({ card, index }) {
  const [
    deleteCardMutation,
    { loading: loadingRemoveMutation, error: deleteError, refetch },
  ] = useMutation(
    gql`
      mutation DeleteCard($id: ID!) {
        removeCard(id: $id) {
          ok
        }
      }
    `
  );
  const [editCardMutation, { loading: loadingEditMutation }] = useMutation(
    gql`
      mutation EditCard($id: ID!, $title: String!, $content: String!) {
        editCard(id: $id, title: $title, content: $content) {
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

  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState(card.title);
  const [newCardContent, setNewCardContent] = useState(card.content);

  function handleRemoveCard(id) {
    setIsRemoveModalOpen(true);
  }

  function handleConfirmRemove() {
    deleteCardMutation({
      variables: { id: card.id },
    });

    setIsRemoveModalOpen(false);
  }

  function handleCancelRemove() {
    setIsRemoveModalOpen(false);
  }

  function openEditModal() {
    setIsEditModalOpen(true);
  }

  function closeEditModal() {
    setIsEditModalOpen(false);
  }

  function handleEditCard(title, content) {
    editCardMutation({
      variables: { id: card.id, title, content },
    });
    closeEditModal();
  }
  
  return (
    <Draggable draggableId={`${card.id}`} key={card.id} index={index}>
      {(provided, snapshot) => (
        <>
          <Container
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            isDragging={snapshot.isDragging}
          >
            <div
              style={{ display: "flex", justifyContent: "center", padding: 2 }}
            >
              <CardTitle>{card.title}</CardTitle>
            </div>
            <div style={{ display: "flex", justifyContent: "start", padding: 2 }}>
              <span>
                <small>
                  <CardContent>{card.content}</CardContent>
                </small>
              </span>
            </div>
            <button
              className="btn btn-delete"
              onClick={() => handleRemoveCard(card.id)}
            >
              Remove
            </button>
            <button
              className="btn btn-edit"
              onClick={() => openEditModal()}
            >
              Edit
            </button>
          </Container>
          <Modal
            isOpen={isRemoveModalOpen}
            onRequestClose={() => setIsRemoveModalOpen(false)}
            style={modalStyles}
          >
            <p>Are you sure you want to remove this card?</p>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <DeleteButton onClick={handleConfirmRemove}>Remove</DeleteButton>
              <DeleteButton onClick={handleCancelRemove}>Cancel</DeleteButton>
            </div>
          </Modal>
          <Modal
          isOpen={isEditModalOpen}
          onRequestClose={closeEditModal}
          style={modalStyles}
        >
          <h4 style={{marginBottom: "16px" }}>Edit card</h4>
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
              onClick={() => handleEditCard(newCardTitle, newCardContent)}
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
              onClick={closeEditModal}
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
        </>
      )}
    </Draggable>
  );
}
