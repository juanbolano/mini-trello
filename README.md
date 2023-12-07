# Prerequisites
* aws-cli

# How to run it

## DynamoDB

### In a terminal run:

```docker pull amazon/dynamodb-local```

```docker run -p 8000:8000 amazon/dynamodb-local -jar DynamoDBLocal.jar -inMemory -sharedDb```

### Open a new terminal, go to the backend folder and then run:

```./init_dynamodb.sh```

## Backend (Python 3.10)

### In a terminal go to the backend folder and run:

```python -m venv venv```

```source venv/bin/activate```

```pip install -r requirements.txt```

```python app.py```

### Unit tests:

```pip install pytest```

```pytest```

## Frontend

### In a terminal go to the frontend/mini-trello folder and run:

```npm install```

```npm start```

