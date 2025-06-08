document.getElementById('estimator-form').addEventListener('submit', function (e) {
      e.preventDefault();

      const area = parseFloat(document.getElementById('area').value);
      const floors = parseInt(document.getElementById('floors').value);
      const wall = parseFloat(document.getElementById('wall').value);
      const height = parseFloat(document.getElementById('height').value);
      const totalArea = area * floors;

      // Material Estimation
      const bricks = Math.round(totalArea * 7);
      const cement = Math.round(totalArea * 0.4);
      const sand = Math.round(totalArea * 0.6);
      const steel = Math.round(totalArea * 4);

      // Rates
      const cementRate = parseFloat(document.getElementById('cementRate').value);
      const sandRate = parseFloat(document.getElementById('sandRate').value);
      const steelRate = parseFloat(document.getElementById('steelRate').value);
      const brickRate = parseFloat(document.getElementById('brickRate').value);

      // Cost Estimation
      const bricksCost = Math.round((bricks / 1000) * brickRate);
      const cementCost = Math.round(cement * cementRate);
      const sandCost = Math.round(sand * sandRate);
      const steelCost = Math.round(steel * steelRate);
      const totalCost = bricksCost + cementCost + sandCost + steelCost;

      // Display Materials
      document.getElementById('bricks').textContent = `${bricks} bricks`;
      document.getElementById('cement').textContent = `${cement} bags`;
      document.getElementById('sand').textContent = `${sand} cft`;
      document.getElementById('steel').textContent = ` ${steel} kg`;

      // Display Costs
      document.getElementById('bricksCost').textContent = bricksCost;
      document.getElementById('cementCost').textContent = cementCost;
      document.getElementById('sandCost').textContent = sandCost;
      document.getElementById('steelCost').textContent = steelCost;
      document.getElementById('totalCost').textContent = totalCost;

      document.getElementById('results').style.display = 'block';

});