from langchain_groq import ChatGroq
from langchain_tavily import TavilySearch
from langchain.messages import SystemMessage
from langgraph.graph import START, END, StateGraph
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import tools_condition, ToolNode
from langgraph.graph.message import add_messages
from typing import TypedDict
from typing_extensions import Annotated
import asyncio
from dotenv import load_dotenv
import os
load_dotenv()

os.environ["GROQ_API_KEY"]=os.getenv("GROQ_API_KEY")
os.environ["TAVILY_API_KEY"]=os.getenv("TAVILY_API_KEY")

# derive a State model from TypedDict
class State(TypedDict):
    messages: Annotated[list, add_messages]

# declare llms and tools
llm = ChatGroq(model="openai/gpt-oss-120b") # openai/gpt-oss-120b
tavily = TavilySearch(max_result=2)
tools = [tavily]
llm_with_tools = llm.bind_tools(tools)

# declare an llm node function
def llm_caller(state: State):
    messages = [SystemMessage(
        content="""
        1. Your name is Steve.
        2. You are a professional chef that searches the internet and finds dishes
        around the world that can be made from the recipe you're given.
        3. When a user gives you ingredients, return an array/list of at most three(3) meal objects the user can prepare
        just an array of meals in exactly this format 
        ['{"name": "...", "origin": "...", "time_it_takes": "in min.(append 'min')", "difficulty": "Easy/Mid/Hard", "description": "...", "ingredients": "..."}',
        '{"name": "...", "origin": "...", "time_to_prepare": "...", "difficulty": "Easy/Mid/Hard", "description": "...", "ingredients": "..."}', ..., '{"user's ingredients": "..., ..."}'}] you must not include any extra texts/emojis.
        4. include the word "can't" in your response expressing how inappropriate it is
        when user tries to make a meal from non edible items. Don't add "[]" for this type of response.
        5. don't respond with markdown.
        6. once in a while, return conversations back to food talk and the likes of it.
        7. when user starts talking about a new dish, ask them for ingredients, don't suggest based on old ingredients
        """.strip()
    ), *state["messages"]]
    return {"messages": llm_with_tools.invoke(messages)}

# instanciate graph builder
builder = StateGraph(State)

# add nodes to builder
builder.add_node("llm caller", llm_caller)
builder.add_node("tools", ToolNode(tools))

# add edges to builder
builder.add_edge(START, "llm caller")
builder.add_conditional_edges("llm caller", tools_condition)
builder.add_edge("tools", "llm caller")

# instanciate memory and compile builder with it to form graph
memory = MemorySaver()
graph = builder.compile(checkpointer=memory)

# create config for each user and call graph with it
config = {"configurable": {"thread_id": "1"}}

# r = asyncio.run(graph.ainvoke({"messages": ["onion, pepper, yam"]}, config=config))
# print(r["messages"][-1].content)