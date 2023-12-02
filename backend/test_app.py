import pytest
from unittest.mock import Mock, MagicMock
from boto3.dynamodb.conditions import Key
from app import add_board, add_column, add_card, update_card_status_in_dynamodb, edit_card_in_dynamodb

@pytest.fixture()
def mock_board_table(mocker) -> Mock:
    return mocker.patch('app.board_table')

@pytest.fixture()
def mock_column_table(mocker) -> Mock:
    return mocker.patch('app.column_table')

@pytest.fixture()
def mock_card_table(mocker) -> Mock:
    return mocker.patch('app.card_table')

def test_add_board(mock_board_table: Mock):
    # Mocking the board_table
    mock_board_table.put_item = MagicMock()

    # Call the function
    result = add_board("Test Board")

    # Assertions
    assert result.title == "Test Board"
    assert result.id is not None  # Assuming a new ID is generated

    # Check if put_item was called with the correct arguments
    mock_board_table.put_item.assert_called_once_with(Item={
        'id': result.id,
        'title': result.title
    })

def test_add_column(mock_column_table: Mock):
    mock_column_table.put_item = MagicMock()

    result = add_column("Test Column", "board_id", 1)

    assert result.title == "Test Column"
    assert result.board == "board_id"
    assert result.order == 1
    assert result.id is not None

    mock_column_table.put_item.assert_called_once_with(Item={
        'id': result.id,
        'title': result.title,
        'order': result.order,
        'board': result.board
    })

def test_add_card(mock_card_table: Mock):
    mock_card_table.put_item = MagicMock()

    result = add_card("Test Card", "test content", "column_id")

    assert result.title == "Test Card"
    assert result.content == "test content"
    assert result.column == "column_id"
    assert result.created is not None
    assert result.id is not None

    mock_card_table.put_item.assert_called_once_with(Item={
        'id': result.id,
        'title': result.title,
        'content': result.content,
        'column': result.column,
        'created': result.created
    })

def test_update_card_status_in_dynamodb(mock_card_table: Mock):
    mock_card_table.query = MagicMock()

    # Mocking the response from DynamoDB
    response_mock = {'Items': [{'id': '123', 'column': 'old_column', 'title': 'test card', 'content': 'test content', 'created': 'test date'}]}
    mock_card_table.query.return_value = response_mock

    result = update_card_status_in_dynamodb("123", "new_column")

    assert result['column'] == "new_column"

    mock_card_table.put_item.assert_called_once_with(Item=result)
    mock_card_table.query.assert_called_once_with(KeyConditionExpression=Key('id').eq('123'))

def test_edit_card_in_dynamodb(mock_card_table: Mock):
    mock_card_table.query = MagicMock()

    response_mock = {'Items': [{'id': '123', 'column': 'old_column', 'title': 'test card', 'content': 'test content', 'created': 'test date'}]}
    mock_card_table.query.return_value = response_mock

    result = edit_card_in_dynamodb("123", "new title", "new content")

    assert result['title'] == "new title"
    assert result['content'] == "new content"

    mock_card_table.put_item.assert_called_once_with(Item=result)
    mock_card_table.query.assert_called_once_with(KeyConditionExpression=Key('id').eq('123'))
