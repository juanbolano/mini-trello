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
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleRemoveCard(id) {
    setIsModalOpen(true);
  }

  function handleConfirmRemove() {
    deleteCardMutation({
      variables: { id: card.id },
    });

    setIsModalOpen(false);
  }

  function handleCancelRemove() {
    setIsModalOpen(false);
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
          </Container>
          <Modal
            isOpen={isModalOpen}
            onRequestClose={() => setIsModalOpen(false)}
            style={modalStyles}
          >
            <p>Are you sure you want to remove this card?</p>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <DeleteButton onClick={handleConfirmRemove}>Remove</DeleteButton>
              <DeleteButton onClick={handleCancelRemove}>Cancel</DeleteButton>
            </div>
          </Modal>
        </>
      )}
    </Draggable>
  );
}
