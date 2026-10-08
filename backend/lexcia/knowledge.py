import json, math, re
from collections import Counter
from pathlib import Path
from pydantic import BaseModel, ConfigDict, Field
class Record(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: str = Field(pattern=r"^[a-z0-9-]+$")
    title: str
    content: str
    provenance: str
class Knowledge:
    def __init__(self, path: Path):
        self.records = [Record.model_validate(value) for value in json.loads(path.read_text())]
        if not self.records or len({r.id for r in self.records}) != len(self.records):
            raise ValueError("Knowledge must contain records with unique IDs")
    def search(self, question: str):
        tokens = lambda text: re.findall(r"\w+", text.casefold())
        query = tokens(question)
        documents = [Counter(tokens(r.title + " " + r.content)) for r in self.records]
        average = sum(sum(d.values()) for d in documents) / len(documents)
        def score(index):
            doc = documents[index]; length = sum(doc.values()); total = 0
            for term in set(query):
                frequency = doc[term]
                count = sum(term in d for d in documents)
                total += math.log(1 + (len(documents)-count+.5)/(count+.5)) * frequency * 2.5 / (frequency + 1.5 * (.25 + .75 * length / average))
            return total
        # This reviewed demo corpus is small: retain all records for scope and unknowns,
        # ranked so the most relevant source comes first.
        return [self.records[i] for i in sorted(range(len(self.records)), key=score, reverse=True)]
    def source(self, record):
        return {"item_id": record.id, "title": record.title, "url": "/api/knowledge/" + record.id}
