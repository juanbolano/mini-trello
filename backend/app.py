from flask import Flask
from flask_cors import CORS
from graphql_server.flask import GraphQLView
import graphene
from graphene import ObjectType, Schema, Field, List, Mutation
import boto3
import uuid
from boto3.dynamodb.conditions import Key, Attr
import datetime


app = Flask(__name__)
CORS(app)

# DynamoDB configuration
dynamodb = boto3.resource('dynamodb', region_name='us-west-2', endpoint_url='http://localhost:8000')
board_table = dynamodb.Table('board')
column_table = dynamodb.Table('column')
card_table = dynamodb.Table('card')

# Model definitions
class CardType(ObjectType):
    id = graphene.ID()
    title = graphene.String()
    content = graphene.String()
    column = graphene.String()
    created = graphene.String()

class ColumnType(ObjectType):
    id = graphene.ID()
    title = graphene.String()
    board = graphene.String()
    order = graphene.Int()

class BoardType(ObjectType):
    id = graphene.ID()
    title = graphene.String()

# Query definitions
class Query(ObjectType):
    boards = List(BoardType, id=graphene.ID())
    columns = List(ColumnType, board=graphene.ID())
    cards = List(CardType, column=graphene.ID())

    def resolve_boards(self, info, id=None):
        # Scan for boards
        if id:
            response = board_table.query(
                KeyConditionExpression=Key('id').eq(id)
            )
        else:
            response = board_table.scan()

        # Get data from boards after scan
        boards_data = response.get('Items', [])

        # Map the data from boards to BoardType instances
        boards = [BoardType(id=board['id'], title=board['title']) for board in boards_data]

        return boards
    
    def resolve_columns(self, info, board=None):
        if board:
            response = column_table.scan(
                FilterExpression=Attr('board').eq(board)
            )
        else:
            response = column_table.scan()
        
        columns_data = response.get('Items', [])
        
        # Order columns by the 'order' field (ASC)
        sorted_columns_data = sorted(columns_data, key=lambda x: x.get('order', 0))

        columns = [ColumnType(id=column['id'], title=column['title'], board=column['board'], order=column['order']) for column in sorted_columns_data]

        return columns
    
    def resolve_cards(self, info, column=None):
        if column:
            response = card_table.scan(
                FilterExpression=Attr('column').eq(column)
            )
        else:
            response = card_table.scan()
        
        cards_data = response.get('Items', [])

        cards = [CardType(id=card['id'], title=card['title'], content=card['content'], column=card['column'], created=card['created']) for card in cards_data]

        return cards

# Mutation definitions
class AddBoardMutation(Mutation):
    class Arguments:
        title = graphene.String()

    board = Field(BoardType)

    def mutate(self, info, title):
        id = str(uuid.uuid4())
        # Implement logic to add a board in DynamoDB
        board_table.put_item(
            Item={
                'id': id,
                'title': title
            }
        )
        return AddBoardMutation(board=BoardType(id=id, title=title))

class AddColumnMutation(Mutation):
    class Arguments:
        title = graphene.String()
        board = graphene.String()
        order = graphene.Int()

    column = Field(ColumnType)

    def mutate(self, info, title, board, order):
        id = str(uuid.uuid4())
        column_table.put_item(
            Item={
                'id': id,
                'title': title,
                'board': board,
                'order': order,
            }
        )
        return AddColumnMutation(column=ColumnType(id=id, title=title, board=board, order=order))

class AddCardMutation(Mutation):
    class Arguments:
        title = graphene.String()
        content = graphene.String()
        column = graphene.String()

    card = Field(CardType)

    def mutate(self, info, title, content, column):
        id = str(uuid.uuid4())
        created = str(datetime.datetime.now())
        card_table.put_item(
            Item={
                'id': id,
                'title': title,
                'content': content,
                'column': column,
                'created': created,
            }
        )
        return AddCardMutation(card=CardType(id=id, title=title, content=content, column=column, created=created))

class UpdateCardMutation(Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        column = graphene.String(required=True)

    card = Field(CardType)

    def mutate(self, info, id, column=None):
        # Update card in DynamoDB
        card = update_card_in_dynamodb(id, column)

        # Return instance of the updated card
        return UpdateCardMutation(card=card)

class RemoveCardMutation(Mutation):
    ok = graphene.Boolean()

    class Arguments:
        id = graphene.ID()

    def mutate(self, info, id):
        card_table.delete_item(Key={"id":id})
        return RemoveCardMutation(ok=True)

class Mutation(ObjectType):
    addBoard = AddBoardMutation.Field()
    addColumn = AddColumnMutation.Field()
    addCard = AddCardMutation.Field()
    updateCard = UpdateCardMutation.Field()
    removeCard = RemoveCardMutation.Field()

# Graphene and Flask configuration
schema = Schema(query=Query, mutation=Mutation)
app.add_url_rule('/', view_func=GraphQLView.as_view('graphql', schema=schema, graphiql=True))

def update_card_in_dynamodb(id, column):
    # Get existing card from DynamoDB
    response = card_table.query(
        KeyConditionExpression=Key('id').eq(id)
    )
    card_data = response.get('Items', [])

    if not card_data:
        raise ValueError(f"No se encontró ninguna card con ID: {id}")

    # Update fields according to the given values
    updated_card = card_data[0]
    updated_card['column'] = column

    card_table.put_item(Item=updated_card)

    return updated_card

if __name__ == '__main__':
    app.run(debug=True)
