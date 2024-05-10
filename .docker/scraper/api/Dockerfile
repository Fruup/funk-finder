FROM python

WORKDIR /work/scraper
EXPOSE 3000

# Install dependencies.
ADD ./scraper/py/requirements.txt .
RUN pip install -r requirements.txt

# Copy sources.
ADD ./scraper/py/*.py py/
# ADD ./scraper/state state/
ADD ./scraper/state/timestamps.ini state/
# ADD ./scraper/state/cookies.sqlite state/

ADD ./scraper/entry.sh .
RUN chmod +x entry.sh

CMD []
ENTRYPOINT ./entry.sh
