defmodule Limit.PageController do
  use Limit.Web, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
