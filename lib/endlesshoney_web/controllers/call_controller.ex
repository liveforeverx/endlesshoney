defmodule EndlesshoneyWeb.CallController do
  use EndlesshoneyWeb, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
