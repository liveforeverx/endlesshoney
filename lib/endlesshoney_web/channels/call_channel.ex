defmodule EndlesshoneyWeb.CallChannel do
  use Phoenix.Channel
  alias EndlesshoneyWeb.Presence

  def join("call", _auth_msg, socket) do
    send(self(), :after_join)
    {:ok, socket}
  end

  def handle_in("message", %{"body" => body}, socket) do
    broadcast! socket, "message", %{body: body}
    {:noreply, socket}
  end

  def handle_info(:after_join, socket) do
    IO.inspect Presence.list(socket)
    push(socket, "presence_state", Presence.list(socket))
    {:ok, _} = Presence.track(socket, socket.assigns.user_id, %{
      online_at: inspect(System.system_time(:second))
    })
    {:noreply, socket}
  end
end
