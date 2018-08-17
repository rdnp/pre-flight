package de.rdnp.eugene;

import org.junit.Test;
import static org.junit.Assert.*;

public class PlaceholderTest {

  @Test
  public void doOp_Default() {
      Placeholder testSubject = new Placeholder();
      int actual = testSubject.doOp();
      assertEquals(1, actual);
  }
}
