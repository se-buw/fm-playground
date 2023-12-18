FROM python:3.10-slim

WORKDIR /backend

COPY . /backend 

RUN apt-get update && apt-get install -y
RUN apt-get install z3 wget -y

RUN pip install --no-cache-dir --upgrade pip setuptools
RUN pip install --no-cache-dir -r requirements.txt

RUN chmod +x ./install_nuxmv.sh
RUN sed -i -e 's/\r$//' install_nuxmv.sh
RUN ./install_nuxmv.sh


EXPOSE 8000

RUN chmod a+x ./entrypoint.sh
ENTRYPOINT [ "./entrypoint.sh" ]