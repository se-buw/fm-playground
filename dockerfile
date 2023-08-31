FROM python:3.10

WORKDIR /z3-playground

COPY . /z3-playground  

EXPOSE 8080

CMD ["python", "simple-server.py"]