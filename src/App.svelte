<div class="wrapper">
  <header class="title">Cellular automata</header>

  <main class="container">
    <canvas id="appCanvas" />

    <div class="controles">
      <fieldset>
        <legend>Current Automaton</legend>
        <div id="list" />
      </fieldset>

      <fieldset>
        <legend>State</legend>
        <div>
          <input type="radio" id="dead" name="state" value="dead" />
          <label for="dead">Dead</label>
        </div>
        <div>
          <input type="radio" id="alive" name="state" value="alive" checked />
          <label for="alive">Alive</label>
        </div>
      </fieldset>

      <button id="next">Next</button>

      <textarea id="log" class="log" />
    </div>
  </main>

  <footer>64</footer>
</div>
