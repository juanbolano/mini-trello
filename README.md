# How to run it

## DynamoDB

### In a terminal run:

```docker pull amazon/dynamodb-local```

```docker run -p 8000:8000 amazon/dynamodb-local -jar DynamoDBLocal.jar -inMemory -sharedDb```

## Backend (Python 3.10)

### In a terminal run:

```python -m venv venv```

```source venv/bin/activate```

```pip install -r requirements.txt```

```python app.py```

### Unit tests:

```pip install pytest```

```pytest```

## Frontend

### In a terminal run:

```npm install```

```npm start```

