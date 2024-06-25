FROM python:3.10-slim

WORKDIR /backend

COPY . /backend 

RUN apt-get update && apt-get install -y
RUN apt-get install z3 wget gcc libc6-dev -y
RUN apt-get install openjdk-17-jdk -y

RUN pip install --no-cache-dir --upgrade pip setuptools
RUN pip install --no-cache-dir -r requirements.txt

RUN sed -i -e 's/\r$//' install_nuxmv.sh entrypoint.sh
RUN chmod +x ./install_nuxmv.sh ./entrypoint.sh
RUN ./install_nuxmv.sh
RUN mkdir logs

EXPOSE 8000
ENTRYPOINT [ "./entrypoint.sh" ]