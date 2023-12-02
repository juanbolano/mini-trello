import React, { useEffect, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import styled from "styled-components";
import Column from "./Column";
import { useLazyQuery, gql, useMutation } from "@apollo/client";
import Modal from "react-modal";

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
const Title = styled.h2`
  text-align: center;
  display: flex;
  alignItems: center;
  justifyContent: space-between;
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

export default function Board({ title, id }) {
  const [draggableId, setDraggableId] = useState("");
  const [droppableId, setDroppableId] = useState("");
  const [isModified, setIsModified] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [newColumnOrder, setNewColumnOrder] = useState("");
  const [columns, setColumns] = useState([]);

  const GET_COLUMNS = gql`
    query {
      columns(board: "${id}") {
        id
        title
      }
    }
  `;
  const [getColumns, { loading, error, data }] = useLazyQuery(GET_COLUMNS);

  const [updateCardStatusMutation, { loading: loadingMutation }] = useMutation(
    gql`
      mutation UpdateCardStatus($id: ID!, $column: String!) {
        updateCardStatus(id: $id, column: $column) {
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

  const [addNewColumnMutation, { loading: loadingAddColumn }] = useMutation(
    gql`
      mutation AddColumn($title: String!, $board: String!, $order: Int!) {
        addColumn(title: $title, board: $board, order: $order) {
          column {
            id
            title
            board
            order
          }
        }
      }
    `
  );

  useEffect(() => {
    getColumns().then(() => {
      setColumns(data?.columns || []);
    });
    if (isModified) {
      updateCardStatusMutation({
        variables: { id: draggableId, column: droppableId },
      })
        .then((response) => {
          setIsModified(false);
          console.log("Mutation response:", response);
        })
        .catch((error) => {
          setIsModified(false);
          console.error("Mutation error:", error);
        });
    }
  }, [isModified, draggableId, droppableId, updateCardStatusMutation, columns, getColumns, data?.columns]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return; // The user canceled the drag and drop operation
    if (source.droppableId === destination.droppableId) return; // Card has not been dragged, no need to do anything

    setDraggableId(draggableId);
    setDroppableId(destination.droppableId);
    setIsModified(true);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewColumnTitle("");
    setNewColumnOrder("");
  };

  const handleAddColumn = () => {
    addNewColumnMutation({
      variables: {
        title: newColumnTitle,
        board: id,
        order: parseInt(newColumnOrder, 10),
      },
    })
      .then(() => {
        closeModal();
        getColumns();
      })
      .catch((error) => {
        console.error("AddColumn mutation error:", error);
      });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Title>
        {title}
        <AddButton onClick={openModal}>Add Column</AddButton>
      </Title>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "row",
        }}
      >
        {loadingAddColumn || loadingMutation ? (
          <p>Loading...</p>
        ) : (          
          columns &&
          columns.map((column, index) => (
            <Column key={index} title={column.title} id={column.id} />
          ))
        )}
      </div>

      {isModalOpen && (
        <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        style={modalStyles}
      >
        <h4 style={{ marginBottom: "16px" }}>Add new column</h4>
        <label style={{ marginBottom: "8px" }}>
          Title:
          <input
            type="text"
            value={newColumnTitle}
            onChange={(e) => setNewColumnTitle(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              boxSizing: "border-box",
              marginBottom: "8px",
            }}
          />
        </label>
        <label style={{ marginBottom: "16px" }}>
          Order:
          <input
            type="number"
            value={newColumnOrder}
            onChange={(e) => setNewColumnOrder(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              boxSizing: "border-box",
              marginBottom: "8px",
            }}
          />
        </label>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={handleAddColumn}
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
            onClick={closeModal}
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
      )}
    </DragDropContext>
  );
}
