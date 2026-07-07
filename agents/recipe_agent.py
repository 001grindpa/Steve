from langchain_groq import ChatGroq
from langchain_tavily import TavilySearch
from typing import TypedDict
from typing_extensions import Annotated
from langgraph.graph import START, END, StateGraph
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition
from langchain.messages import SystemMessage
from dotenv import load_dotenv
import os
import asyncio

load_dotenv()
os.environ["GROQ_API_KEY"] = os.getenv("GROQ_API_KEY")
os.environ["TAVILY_API_KEY"] = os.getenv("TAVILY_API_KEY")

# implement the state class
class State(TypedDict):
    messages: Annotated[list, add_messages]

# implement llm and tools
llm = ChatGroq(model="openai/gpt-oss-20b")
tavily = TavilySearch(max_result=2)
llm_with_tool = llm.bind_tools([tavily])

def llm_caller(state: State):
    messages = [SystemMessage(
        content="""
        pay close attention to these instructions:
        1. Your name is Recipe finder, a cook agent that searches the internet for recipes based on the dish given to you.
        2. Do not respond in markdown, just pure text.
        3. You must respond with an array of json objects containing,
        [
            {"dish_name": "the exact dish name you were given(case sensitive)"},
            {"ingredients", "the ingredients you were given seperated with a comma"},
            {"quantities": "example, 1 cup, 2 spoons.. of those ingredinets, respect position"},
            {"steps": "procedure steps seperated by a comma"}
        ]
        """.strip()
    ), *state["messages"]]
    return {"messages": [llm_with_tool.invoke(messages)]}
    # because the returned dict looks like a state instance but not a direct instance of the
    # state class, this is a typical example of doc typing in polymorphism
    # the graph accepts it as a valid response

# start building graph
graph_builder = StateGraph(State)

# implement nodes
graph_builder.add_node("llm_caller", llm_caller)
graph_builder.add_node("tools", ToolNode([tavily]))

# link with edges
graph_builder.add_edge(START, "llm_caller")
graph_builder.add_conditional_edges("llm_caller", tools_condition)
graph_builder.add_edge("tools", "llm_caller")

# compile graph
graph = graph_builder.compile()
# implement config
config = {"configurable": {"thread_id": 1000}}

async def query_graph(q: str)->str:
    r = await graph.ainvoke({"messages": q}, config=config)
    print(r["messages"][-1].content)

asyncio.run(query_graph("""name=Pineapple Mango Rice Pudding,
                        ingredients="rice, milk, sugar, vanilla extract, cinnamon,
                        pineapple, mango" """.strip()))