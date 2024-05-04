FROM python

WORKDIR /work/scraper
EXPOSE 3000

# Install dependencies.
ADD ./scraper/py/requirements.txt .
RUN pip install -r requirements.txt

# Copy sources.
ADD ./scraper/py/*.py py/
ADD ./scraper/state state/

ENTRYPOINT fastapi run py/api.py --port 3000
